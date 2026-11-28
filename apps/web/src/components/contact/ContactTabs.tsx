'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ContactCard from '@/components/contact/ContactCard';
import SlotBookingCard from '@/components/contact/SlotBookingCard';

export function ContactTabs() {
  return (
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
  );
}
