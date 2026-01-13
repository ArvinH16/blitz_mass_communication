import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Convert the file to a buffer
        const buffer = await file.arrayBuffer();

        // Read the Excel file
        const workbook = new ExcelJS.Workbook();

        try {
            await workbook.xlsx.load(buffer);
        } catch (e) {
            console.error('Failed to load xlsx', e);
            return NextResponse.json(
                { success: false, message: 'Invalid Excel file. Please ensure it is a valid .xlsx file.' },
                { status: 400 }
            );
        }

        // Get the "Main Roster" sheet (case-insensitive)
        const targetSheetName = 'Main Roster';

        // Find the sheet with case-insensitive matching
        const sheet = workbook.worksheets.find(s =>
            s.name.toLowerCase() === targetSheetName.toLowerCase()
        );

        if (!sheet) {
            const sheetNames = workbook.worksheets.map(s => s.name);
            return NextResponse.json(
                {
                    success: false,
                    message: `Sheet "${targetSheetName}" not found in the Excel file. Available sheets: ${sheetNames.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Convert the worksheet to JSON
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: Record<string, any>[] = [];
        const headers: Record<number, string> = {};

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                row.eachCell((cell, colNumber) => {
                    headers[colNumber] = cell.value?.toString() || '';
                });
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rowData: Record<string, any> = {};
                row.eachCell((cell, colNumber) => {
                    const header = headers[colNumber];
                    if (header) {
                        let value = cell.value;
                        if (value && typeof value === 'object') {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const valObj = value as any;
                            if ('text' in valObj) value = valObj.text;
                            else if ('result' in valObj) value = valObj.result;
                        }
                        rowData[header] = value;
                    }
                });
                if (Object.keys(rowData).length > 0) {
                    data.push(rowData);
                }
            }
        });

        // Process the data to extract contacts
        const contacts = data.map((row: unknown) => {
            // Cast row to a more specific type
            const typedRow = row as Record<string, unknown>;

            // Find the name and phone columns (case-insensitive)
            const nameKey = Object.keys(typedRow).find(key =>
                key.toLowerCase().includes('name') ||
                key.toLowerCase().includes('first') ||
                key.toLowerCase().includes('last')
            );

            const phoneKey = Object.keys(typedRow).find(key =>
                key.toLowerCase().includes('phone') ||
                key.toLowerCase().includes('number') ||
                key.toLowerCase().includes('mobile')
            );

            if (!nameKey || !phoneKey) {
                return null;
            }

            // Format phone number (remove any non-digit characters)
            let phoneNumber = String(typedRow[phoneKey]).replace(/\D/g, '');

            // Add country code if not present (assuming US numbers)
            if (phoneNumber.length === 10) {
                phoneNumber = '+1' + phoneNumber;
            } else if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+' + phoneNumber;
            }

            return {
                name: String(typedRow[nameKey]).trim(),
                phone: phoneNumber
            };
        }).filter(Boolean);

        if (contacts.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No valid contacts found in the Excel file' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            contacts
        });
    } catch (error) {
        console.error('Error parsing Excel file:', error);
        return NextResponse.json(
            { success: false, message: 'Error parsing Excel file' },
            { status: 500 }
        );
    }
} 