import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Phone, Instagram, MessageCircle, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { contactAPI } from '../utils/api-direct';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await contactAPI.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        eventType: formData.eventType || 'other',
        eventDate: formData.eventDate || undefined,
        message: formData.message
      });

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your inquiry! I\'ll get back to you within 24 hours.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventType: '',
        eventDate: '',
        message: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again or contact me directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6 text-gray-900">
            Let's Make Magic Together
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to book DJ Kurt for your special event? Get in touch today for a 
            personalized quote and let's start planning your perfect celebration.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl mb-6 text-gray-900">Send Me a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitStatus && (
                  <Alert
                    className={`w-full text-base ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}
                  >
                    {submitStatus.type === 'success' && <CheckCircle2 size={20} className="mt-0.5" />}
                    <AlertDescription className="w-full text-inherit leading-relaxed">
                      {submitStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-gray-700 mb-2">Name *</label>
                    <Input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-gray-700 mb-2">Email *</label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-gray-700 mb-2">Phone</label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(808) 268-2272"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-event-date" className="block text-gray-700 mb-2">Event Date</label>
                    <Input
                      id="contact-event-date"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-event-type" className="block text-gray-700 mb-2">Event Type *</label>
                  <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                    <SelectTrigger
                      id="contact-event-type"
                      className="w-full"
                      aria-label="Event type"
                    >
                      <SelectValue placeholder="Select your event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="private">Private Party</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-gray-700 mb-2">Tell me about your event</label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Share details about your venue, guest count, music preferences, and any special requests..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Direct Contact */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl mb-4 text-gray-900">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Mail className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="text-gray-900">djkurtmaui@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                      <Phone className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="text-gray-900">(808) 268-2272</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                      <Instagram className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-600">Instagram</p>
                      <p className="text-gray-900">@kurtle808shellsmaui</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-600">WhatsApp</p>
                      <p className="text-gray-900">(808) 268-2272</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Area */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl mb-4 text-gray-900 flex items-center gap-2">
                  <MapPin className="text-yellow-500" size={20} />
                  Service Area
                </h3>
                <p className="text-gray-600 mb-4">
                  Proudly serving all of Maui and surrounding areas
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Wailea</Badge>
                  <Badge variant="secondary">Kihei</Badge>
                  <Badge variant="secondary">Lahaina</Badge>
                  <Badge variant="secondary">Kaʻanapali</Badge>
                  <Badge variant="secondary">Makena</Badge>
                  <Badge variant="secondary">Paia</Badge>
                  <Badge variant="secondary">Hana</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl mb-4 text-gray-900 flex items-center gap-2">
                  <Clock className="text-yellow-500" size={20} />
                  Quick Response
                </h3>
                <p className="text-gray-600 mb-4">
                  I typically respond to inquiries within 4-6 hours during business hours.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Peak Season (December - April):</strong> Book 6-12 months in advance for best availability.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Process */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl mb-4 text-gray-900 flex items-center gap-2">
                  <Calendar className="text-yellow-500" size={20} />
                  Booking Process
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-gray-600">Send inquiry with event details</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-gray-600">Receive custom quote within 24 hours</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-gray-600">Schedule consultation call</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <p className="text-gray-600">Sign contract and secure date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}