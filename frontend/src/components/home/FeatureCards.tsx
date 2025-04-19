import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getSiteSettings } from "@/api/entities";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Star,
  Calendar,
  Clock,
  Home,
  Users,
  Scissors,
  ChevronLeft,
  Award,
  LucideIcon
} from "lucide-react";
import { SiteSettings } from "@/types";

interface FeatureCardsProps {
  siteSettings?: SiteSettings | null;
}

export default function FeatureCards({ siteSettings }: FeatureCardsProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (siteSettings) {
        setSettings(siteSettings);
        setIsLoading(false);
        return;
      }
      
      try {
        const siteSettingsData = await getSiteSettings();
        setSettings(siteSettingsData);
      } catch (error: unknown) {
        console.error('Error loading feature cards:', error instanceof Error ? error.message : 'An unknown error occurred');
      }
      setIsLoading(false);
    };

    loadSettings();
  }, [siteSettings]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!settings || !settings.feature_cards || settings.feature_cards.length === 0) {
    return null;
  }

  const getIconComponent = (iconName: string): React.ReactElement => {
    if (iconName && (iconName.startsWith('http') || iconName.startsWith('/'))) {
      return <img src={iconName} alt="Feature icon" className="w-8 h-8 object-contain" />;
    }
    
    const iconMap: Record<string, LucideIcon> = {
      'Calendar': Calendar,
      'Clock': Clock,
      'Home': Home,
      'Users': Users,
      'Scissors': Scissors,
      'Award': Award
    };

    const Icon = iconMap[iconName];
    if (Icon) {
      return <Icon className="w-8 h-8" style={{ color: 'var(--card-icon-color)' }} />;
    }
    
    return <Star className="w-8 h-8" style={{ color: 'var(--card-icon-color)' }} />;
  };

  const activeCards = settings.feature_cards
    .filter(card => card.is_active)
    .sort((a, b) => a.order - b.order);

  const bgStyle: React.CSSProperties = {};
  if (settings.features_section.background_type === "color") {
    bgStyle.backgroundColor = settings.features_section.background_value;
  } else if (settings.features_section.background_type === "image") {
    bgStyle.backgroundImage = `url(${settings.features_section.background_value})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  return (
    <div className="py-12 px-6 md:px-8" style={bgStyle} dir="rtl">
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: 'var(--section-title-color)' }}>
          {settings.features_section.title_he || "היתרונות שלנו"}
        </h2>
        {settings.features_section.description_he && (
          <p className="max-w-2xl mx-auto"
            style={{ color: 'var(--section-subtitle-color)' }}>
            {settings.features_section.description_he}
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-6 mx-auto max-w-[350px] md:max-w-none">
          {activeCards.map((card, index) => (
            <Card 
              key={index} 
              className="shadow hover:shadow-md transition-shadow w-full md:w-[350px] min-h-[180px]"
              style={{ backgroundColor: 'var(--card-bg-color)' }}
            >
              <CardHeader className="flex flex-row-reverse items-center gap-4 pb-2">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-50">
                  {React.cloneElement(getIconComponent(card.icon), {
                    style: { color: 'var(--card-icon-color)' }
                  })}
                </div>
                <CardTitle 
                  className="text-xl text-center w-full"
                  style={{ color: 'var(--card-title-color)' }}
                >
                  {card.title_he}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p 
                  className="text-center"
                  style={{ color: 'var(--card-text-color)' }}
                >
                  {card.description_he}
                </p>
              </CardContent>
              {card.cta_text_he && card.cta_link && (
                <CardFooter className="pt-2 justify-center">
                  <Link to={createPageUrl(card.cta_link.replace(/^\//, ''))}>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-normal hover:bg-transparent"
                      style={{ color: 'var(--card-button-color)' }}
                    >
                      {card.cta_text_he}
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 