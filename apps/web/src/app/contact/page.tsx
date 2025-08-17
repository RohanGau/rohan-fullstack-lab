'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ContactCard from '@/components/contact/ContactCard';
import SlotBookingCard from '@/components/contact/SlotBookingCard';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-center">Get in touch</h1>
      <Tabs defaultValue="book" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="book">Book a meeting</TabsTrigger>
        </TabsList>
        <TabsContent value="contact">
          <ContactCard />
        </TabsContent>
        <TabsContent value="book">
          <SlotBookingCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
