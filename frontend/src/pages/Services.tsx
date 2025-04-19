import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ServiceAPI, ReviewAPI } from "@/api/entities";
import { Service, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, Loader2, Star as StarIcon } from "lucide-react";

interface ServiceRating {
  average: string;
  count: number;
}

interface ServiceWithImage extends Service {
  image_url?: string;
  is_active?: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [serviceRatings, setServiceRatings] = useState<Record<string, ServiceRating>>({});

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        const servicesList = await ServiceAPI.list();
        setServices(servicesList.filter(s => s.is_active));

        const approvedReviews = await ReviewAPI.filter({ status: "approved" });
        setReviews(approvedReviews);

        const ratings: Record<string, ServiceRating> = {};
        servicesList.forEach(service => {
          const serviceReviews = approvedReviews.filter(review => review.service_id === service.id);
          if (serviceReviews.length > 0) {
            const totalRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0);
            ratings[service.id] = {
              average: (totalRating / serviceReviews.length).toFixed(1),
              count: serviceReviews.length
            };
          }
        });
        setServiceRatings(ratings);
      } catch (error: unknown) {
        console.error("Error loading services:", error instanceof Error ? error.message : 'An unknown error occurred');
      }
      setIsLoading(false);
    };
    
    loadServices();
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; 
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    
    return stars;
  };

  const getServiceReviews = (serviceId: string): Review[] => {
    return reviews.filter(review => review.service_id === serviceId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="flex flex-col gap-8">
        <div className="text-right">
          <h1 className="text-3xl font-bold mb-4">השירותים שלנו</h1>
          <p className="text-gray-600">בחר את השירות הרצוי</p>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {service.image_url && (
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${service.image_url})` }}
                  />
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1">
                      {serviceRatings[service.id] && (
                        <>
                          <div className="flex">{renderStars(parseFloat(serviceRatings[service.id].average))}</div>
                          <span className="text-sm text-gray-500">
                            ({serviceRatings[service.id].count})
                          </span>
                        </>
                      )}
                    </div>
                    <CardTitle className="text-right">{service.name}</CardTitle>
                  </div>
                  <div className="flex items-center justify-end gap-4">
                    <Badge variant="secondary">{service.duration} דקות</Badge>
                    <div className="font-semibold text-blue-600">₪{service.price}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-right">{service.description}</p>
                  
                  {serviceRatings[service.id] && getServiceReviews(service.id).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2 text-right">ביקורות לקוחות</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {getServiceReviews(service.id).slice(0, 2).map((review) => (
                          <div key={review.id} className="text-sm text-right">
                            <div className="flex justify-end mb-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <StarIcon key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Link to={createPageUrl("Book")} className="w-full">
                    <Button className="w-full">
                      <CalendarPlus className="w-4 h-4 ml-2" />
                      קבע תור
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}