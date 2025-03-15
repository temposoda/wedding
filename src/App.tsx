const SHEET_ID = "105idB8rdnBT5nqC9DuUE495Nxp3CIJk-Z7q0umeMhC8";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gem, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

interface AdviceEntry {
  name: string;
  relationship: string;
  advice: string;
}

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

const WeddingAdvice: React.FC = () => {
  const [advice, setAdvice] = useState<AdviceEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const fetchAdvice = async (): Promise<void> => {
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const { data } = Papa.parse(csvText, {
          header: false, // if your first row isn't headers
          skipEmptyLines: true,
        });
        const entries: AdviceEntry[] = (data as string[][])
          .slice(1) // Skip header row
          .map(([name, relationship, advice]) => ({
            name,
            relationship,
            advice,
          }))
          .filter((entry) => entry.name && entry.advice);

        setAdvice(entries);
        setLoading(false);
      } catch (err) {
        setError("Failed to load wedding advice");
        setLoading(false);
      }
    };

    fetchAdvice();
  }, []);

  const navigateToPage = (newIndex: number) => {
    if (advice.length === 0) return;
    if (newIndex < 0 || newIndex >= advice.length) return;
    
    setCurrentIndex(newIndex);
  };

  const goToNextPage = () => {
    navigateToPage(currentIndex + 1);
  };

  const goToPreviousPage = () => {
    navigateToPage(currentIndex - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Opening advice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  const currentAdvice = advice[currentIndex];

  const handleTouchNavigation = (e: React.TouchEvent) => {
    const touchX = e.changedTouches[0].clientX;
    const screenWidth = window.innerWidth;
    
    // Only detect taps on the outer 15% of the screen edges
    if (touchX < screenWidth * 0.15) {
      // Left edge of screen - go to previous
      if (currentIndex > 0) goToPreviousPage();
    } else if (touchX > screenWidth * 0.85) {
      // Right edge of screen - go to next
      if (currentIndex < advice.length - 1) goToNextPage();
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-amber-50 to-white opacity-0 transition-opacity duration-1000 ${
        mounted ? "opacity-100" : ""
      }`}
      onTouchEnd={handleTouchNavigation}
    >
      <style jsx>{`
        @keyframes bookReveal {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-book-reveal {
          animation: bookReveal 0.5s ease-out forwards;
        }

        .book-border {
          border: 2px solid #964b00;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          background: linear-gradient(45deg, #f3e7d9, #fff);
        }

        .legible {
          max-width: 80ch;
        }
        
        .advice-card {
          line-height: 1.6;
          letter-spacing: 0.01em;
        }
      `}</style>

      <header className="text-center py-12">
        <Gem className="mx-auto text-amber-700 w-16 h-16 mb-4" />
        <h1
          className="text-4xl font-serif mb-2"
          style={{ fontFamily: "Baskerville, serif" }}
        >
          Kiley & Michael
        </h1>
        <p className="text-gray-600">Use arrows to navigate or tap edges on mobile</p>
      </header>

      <main className="container mx-auto px-4 pb-16">
        {currentAdvice && (
          <div className="flex flex-col items-center">
            {/* Visual indicators for touch areas (mobile) */}
            <div className="md:hidden w-full flex justify-between absolute top-0 h-full pointer-events-none">
              <div className="w-12 h-full bg-amber-50 bg-opacity-30 rounded-l-lg"></div>
              <div className="w-12 h-full bg-amber-50 bg-opacity-30 rounded-r-lg"></div>
            </div>
            <div className="flex justify-center items-center relative">
              <Card className="bg-white shadow-lg legible">
                {/* Top navigation on mobile */}
                <div className="md:hidden flex justify-between items-center border-b p-3 bg-amber-50 bg-opacity-30 rounded-t-lg">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goToPreviousPage}
                    disabled={currentIndex === 0}
                    className="px-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="text-amber-800 font-medium">
                    {currentIndex + 1} / {advice.length}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goToNextPage}
                    disabled={currentIndex === advice.length - 1}
                    className="px-2"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                <CardContent className="p-6 advice-card">
                  <div className="text-gray-800 mb-6 font-serif text-lg min-h-[240px]">
                    {currentAdvice.advice.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="text-right font-medium text-amber-700 mt-4">
                    — {currentAdvice.name}
                    {currentAdvice.relationship && (
                      <span className="text-gray-500 text-sm ml-2">
                        ({currentAdvice.relationship})
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:block hidden">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={goToPreviousPage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft />
                Previous
              </Button>
              
              <div className="text-amber-800 font-medium px-4">
                {currentIndex + 1} / {advice.length}
              </div>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={goToNextPage}
                disabled={currentIndex === advice.length - 1}
              >
                Next
                <ChevronRight />
              </Button>
              
              {currentIndex > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="mt-2 w-full sm:w-auto"
                  onClick={() => navigateToPage(0)}
                >
                  Start Over
                </Button>
              )}
            </div>
            
            {/* Fixed bottom navigation for mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousPage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft />
                Prev
              </Button>
              
              {currentIndex > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateToPage(0)}
                >
                  Start Over
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPage}
                disabled={currentIndex === advice.length - 1}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
            
            {/* Bottom padding to account for fixed navigation on mobile */}
            <div className="md:hidden h-16"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeddingAdvice;
