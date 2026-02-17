import { apiRequest } from "@/lib/api";

export interface TelegramConfig {
    id?: number;
    bot_token: string;
    chat_id: string;
    is_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

export const settingsService = {
    getTelegramConfig: async (): Promise<TelegramConfig> => {
        return apiRequest<TelegramConfig>("/admin/telegram-config/");
    },
    updateTelegramConfig: async (config: TelegramConfig): Promise<TelegramConfig> => {
        return apiRequest<TelegramConfig>("/admin/telegram-config/", {
            method: "POST",
            body: JSON.stringify(config),
        });
    },
};
