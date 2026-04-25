'use client';
import { useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import jsPDF from 'jspdf';
import { Button } from './button';
import { Download, QrCode } from 'lucide-react';

interface OrgQrCodeProps {
    orgName: string;
    joinUrl: string;
}

export default function OrgQrCode({ orgName, joinUrl }: OrgQrCodeProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = () => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (!canvas) return;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        pdf.setFontSize(20);
        pdf.text(`Join ${orgName}`, 40, 60);
        pdf.addImage(imgData, 'PNG', 40, 80, 250, 250);
        pdf.setFontSize(12);
        pdf.text(joinUrl, 40, 350);
        pdf.save(`${orgName.replace(/\s+/g, '_')}_QR.pdf`);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <QrCode className="h-3.5 w-3.5" /> Join QR Code
            </div>
            <div
                ref={qrRef}
                className="mt-3 rounded-2xl border border-border/80 bg-white p-5 shadow-soft"
            >
                <QRCode value={joinUrl} size={220} quietZone={8} ecLevel="H" />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">Join {orgName}</h3>
            <code className="mt-2 max-w-full break-all rounded-md bg-muted px-2 py-1 text-[11px] font-mono text-muted-foreground">
                {joinUrl}
            </code>
            <Button onClick={handleDownloadPdf} className="mt-4 w-full" variant="outline">
                <Download className="h-4 w-4" /> Download as PDF
            </Button>
        </div>
    );
}
