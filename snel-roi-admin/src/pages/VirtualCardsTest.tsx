import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { virtualCardService, VirtualCard } from "@/services/virtualCardService";

export default function VirtualCardsTest() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setError(null);
      const data = await virtualCardService.getAll();
      console.log('Fetched virtual cards:', data);
      setCards(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to fetch virtual cards", error);
      setError(error.message || 'Failed to load virtual cards');
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Error Loading Virtual Cards</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchCards}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Virtual Cards Management (Test)</h1>
        <p className="text-muted-foreground">Manage virtual card applications and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Virtual Cards ({cards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No Virtual Cards</h3>
              <p className="text-muted-foreground">
                No virtual card applications have been submitted yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Customer:</strong> {card.customer_name || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {card.customer_email || 'N/A'}
                    </div>
                    <div>
                      <strong>Card Type:</strong> {card.card_type_display || card.card_type || 'N/A'}
                    </div>
                    <div>
                      <strong>Status:</strong> {card.status_display || card.status || 'N/A'}
                    </div>
                    <div>
                      <strong>Daily Limit:</strong> ${card.daily_limit || '0.00'}
                    </div>
                    <div>
                      <strong>Monthly Limit:</strong> ${card.monthly_limit || '0.00'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}