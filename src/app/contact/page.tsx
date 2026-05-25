import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Contact — Besaw's Bee Sauce",
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <h1 className="font-serif text-4xl font-bold text-amber-900 mb-4">Get in Touch</h1>
      <p className="text-amber-600 mb-10">
        Questions about an order, wholesale inquiries, or just want to talk bees? We&apos;d love to hear from you.
      </p>

      <form
        action="https://formspree.io/f/YOUR_FORM_ID"
        method="POST"
        className="space-y-6"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-amber-800 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border border-amber-300 rounded-xl px-4 py-2.5 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border border-amber-300 rounded-xl px-4 py-2.5 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-amber-800 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full border border-amber-300 rounded-xl px-4 py-2.5 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}
