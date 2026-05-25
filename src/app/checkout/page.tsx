import Link from 'next/link'

interface CheckoutPageProps {
  searchParams: Promise<{ success?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { success } = await searchParams

  if (success === 'true') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-6">🍯</div>
        <h1 className="font-serif text-3xl font-bold text-amber-900 mb-4">Order Confirmed!</h1>
        <p className="text-amber-700 mb-8">
          Thank you for your order. We&apos;ll get your bee products packed up and shipped soon.
          A confirmation email is on its way.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Keep Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="font-serif text-3xl font-bold text-amber-900 mb-4">Checkout</h1>
      <p className="text-amber-600 mb-8">
        You&apos;ll be redirected to Stripe to complete your purchase securely.
      </p>
      <Link href="/cart" className="text-amber-700 underline underline-offset-4">
        &larr; Back to cart
      </Link>
    </div>
  )
}
