import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { settingsService, TelegramConfig } from "@/services/settingsService";
import { Loader2, Send, Save, Bell, Shield } from "lucide-react";

export default function Settings() {
    const [config, setConfig] = useState<TelegramConfig>({
        bot_token: "",
        chat_id: "",
        is_enabled: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await settingsService.getTelegramConfig();
                if (data && data.bot_token) {
                    setConfig(data);
                }
            } catch (error) {
                console.error("Failed to fetch Telegram config", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            await settingsService.updateTelegramConfig(config);
            setMessage({ type: "success", text: "Telegram configuration saved successfully." });
        } catch (error) {
            console.error("Failed to save Telegram config", error);
            setMessage({ type: "error", text: "Failed to save configuration. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">System Settings</h2>
                <p className="text-muted-foreground">Manage system-wide configurations and integrations.</p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${message.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-600"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}>
                    {message.type === "success" ? <Shield className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    {message.text}
                </div>
            )}

            <div className="grid gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Send className="h-24 w-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Telegram Notifications
                        </CardTitle>
                        <CardDescription>
                            Configure a Telegram bot to receive real-time alerts for transfers and withdrawal attempts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bot-token">Bot API Token</Label>
                                    <Input
                                        id="bot-token"
                                        type="password"
                                        placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
                                        value={config.bot_token}
                                        onChange={(e) => setConfig({ ...config, bot_token: e.target.value })}
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Get this from <a href="https://t.me/botfather" target="_blank" className="underline text-primary">@BotFather</a> on Telegram.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="chat-id">Admin Chat ID / Channel ID</Label>
                                    <Input
                                        id="chat-id"
                                        placeholder="-100123456789"
                                        value={config.chat_id}
                                        onChange={(e) => setConfig({ ...config, chat_id: e.target.value })}
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Use <a href="https://t.me/userinfobot" target="_blank" className="underline text-primary">@userinfobot</a> to find your Chat ID.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="is-enabled"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={config.is_enabled}
                                        onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                                    />
                                    <Label htmlFor="is-enabled" className="text-sm cursor-pointer font-medium">
                                        Enable Telegram Notifications
                                    </Label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <Button type="submit" className="gap-2" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Configuration
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">How to setup</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Message <strong>@BotFather</strong> on Telegram to create a new bot and get the Token.</li>
                            <li>Start a conversation with your bot or add it to a group.</li>
                            <li>Message <strong>@userinfobot</strong> to get your personal Chat ID or the Group Chat ID.</li>
                            <li>Enter the credentials above and save.</li>
                            <li>Toggle "Enable" to start receiving real-time transaction notifications.</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
