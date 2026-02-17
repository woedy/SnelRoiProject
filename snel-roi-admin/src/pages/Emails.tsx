import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { emailService, type OutgoingEmailDetail, type OutgoingEmailListItem } from "@/services/emailService";
import { Eye, Paperclip, RefreshCw } from "lucide-react";

function StatusBadge({ status }: { status: OutgoingEmailListItem["status"] }) {
  if (status === "SENT") return <Badge variant="success">SENT</Badge>;
  if (status === "FAILED") return <Badge variant="destructive">FAILED</Badge>;
  return <Badge variant="warning">PENDING</Badge>;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function Emails() {
  const [items, setItems] = useState<OutgoingEmailListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OutgoingEmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status) p.set("status", status);
    return p;
  }, [q, status]);

  const fetchList = async () => {
    try {
      const data = await emailService.getAll(params);
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const openDetail = async (id: number) => {
    setSelectedId(id);
    setOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await emailService.getById(id);
      setDetail(d);
    } catch (err) {
      console.error("Failed to fetch email detail", err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Loading emails..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Emails
          </h2>
          <p className="text-muted-foreground">Audit log of all outgoing emails.</p>
        </div>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setIsRefreshing(true);
            fetchList();
          }}
          disabled={isRefreshing}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle>Sent Emails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search subject / to / from"
            />
            <div className="flex gap-2">
              <Button
                variant={status === "" ? "default" : "outline"}
                onClick={() => setStatus("")}
              >
                All
              </Button>
              <Button
                variant={status === "SENT" ? "default" : "outline"}
                onClick={() => setStatus("SENT")}
              >
                Sent
              </Button>
              <Button
                variant={status === "FAILED" ? "default" : "outline"}
                onClick={() => setStatus("FAILED")}
              >
                Failed
              </Button>
              <Button
                variant={status === "PENDING" ? "default" : "outline"}
                onClick={() => setStatus("PENDING")}
              >
                Pending
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Status</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>To</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/50 border-border/50 transition-colors">
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="font-medium max-w-[360px] truncate">
                    {e.subject || <span className="text-muted-foreground italic">(no subject)</span>}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate">{e.to_emails}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{e.from_email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(e.created_at)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(e.sent_at)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Paperclip className="h-4 w-4" />
                      {e.attachment_count ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => openDetail(e.id)}>
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No emails found.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              {selectedId ? `Email #${selectedId}` : ""}
            </DialogDescription>
          </DialogHeader>

          {detailLoading && <div className="text-sm text-muted-foreground">Loading...</div>}

          {!detailLoading && detail && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={detail.status} />
                  <span className="text-sm text-muted-foreground">{detail.backend}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Subject</div>
                  <div className="font-medium">{detail.subject || "(no subject)"}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">To</div>
                  <div className="font-mono text-sm break-words">{detail.to_emails}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">From</div>
                  <div className="font-mono text-sm break-words">{detail.from_email || "-"}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-sm">{formatDateTime(detail.created_at)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Sent</div>
                    <div className="text-sm">{formatDateTime(detail.sent_at)}</div>
                  </div>
                </div>

                {detail.status === "FAILED" && detail.error_message && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                    <div className="text-xs text-muted-foreground">Error</div>
                    <div className="text-sm whitespace-pre-wrap">{detail.error_message}</div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Attachments</div>
                  {detail.attachments.length === 0 && (
                    <div className="text-sm text-muted-foreground">No attachments.</div>
                  )}
                  {detail.attachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{a.filename}</div>
                        <div className="text-xs text-muted-foreground truncate">{a.content_type || "unknown"} • {a.size} bytes</div>
                      </div>
                      {a.file_url && (
                        <Button asChild size="sm" variant="outline">
                          <a href={a.file_url} target="_blank" rel="noreferrer">
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">HTML Body</div>
                <div className="rounded-md border bg-background">
                  <ScrollArea className="h-[420px]">
                    <div className="p-3">
                      {detail.html_body ? (
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: detail.html_body }}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">No HTML body.</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="text-xs text-muted-foreground">Text Body</div>
                <div className="rounded-md border bg-background">
                  <ScrollArea className="h-[220px]">
                    <pre className="p-3 text-xs whitespace-pre-wrap break-words">{detail.text_body || ""}</pre>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
