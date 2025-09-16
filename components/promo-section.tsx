import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PromoSection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 md:p-12 text-center border-2 border-primary/20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Flat 7.5% Cashback*</h2>
            <p className="text-xl text-muted-foreground mb-8">On StyleHub Credit Card purchases</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <img src="/credit-card-close-up.png" alt="Credit Card" className="h-12 w-auto" />
              </div>
              <Button size="lg" className="px-8">
                Apply Now
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">*Terms and conditions apply</p>
          </div>
        </Card>
      </div>
    </section>
  )
}
