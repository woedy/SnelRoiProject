import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verificationService, VerificationCode } from "@/services/verificationService";
import { Loader2, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function VerificationCodes() {
    const [codes, setCodes] = useState<VerificationCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCodes = async () => {
        try {
            const data = await verificationService.getAll();
            setCodes(data);
        } catch (error) {
            console.error("Failed to fetch codes", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Verification Codes</h2>
                <p className="text-muted-foreground">Monitor OTP codes sent for email verification, password resets, and transaction verification.</p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Recent Codes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead>User Email</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Sent At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Used At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {codes.map((code) => (
                                <TableRow key={code.id} className="hover:bg-muted/50 border-border/50 transition-colors">
                                    <TableCell className="font-medium">{code.user_email}</TableCell>
                                    <TableCell>
                                        <code className="bg-muted px-2 py-1 rounded text-primary font-mono font-bold tracking-widest">
                                            {code.code}
                                        </code>
                                    </TableCell>
                                    <TableCell>{code.purpose_display}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(code.created_at), "MMM d, yyyy HH:mm:ss")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {code.used_at ? (
                                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500 ring-1 ring-inset ring-green-500/20">
                                                <CheckCircle2 className="h-3 w-3" /> Used
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-600 ring-1 ring-inset ring-yellow-500/20">
                                                <Clock className="h-3 w-3" /> Pending
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {code.used_at ? (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(code.used_at), "MMM d, yyyy HH:mm:ss")}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {codes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                                        No verification codes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
