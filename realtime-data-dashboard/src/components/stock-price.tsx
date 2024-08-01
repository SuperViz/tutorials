import { Stock } from "../common/types"
import { DateTime } from 'luxon'

type Props = { 
  stock: Stock
}

export function StockPrice({ stock }: Props) {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  }

  const formatDateTime = (date: string) => { 
    return DateTime.fromISO(date).toFormat('DD HH:mm:ss') 
  }

  return (
    <div className="p-6 border border-solid border-gray-300 bg-white min-w-40 rounded-xl h-fit shadow-md">
      <h1>{stock.name}</h1>
      <p>{stock.symbol}</p>
      <p>Current Price: {formatPrice(stock.price)}</p>
      <p>Lower Price: {formatPrice(stock.low)}</p>
      <p>Higher Price: {formatPrice(stock.high)}</p>
      <p>Updated At: {formatDateTime(stock.updatedAt)}</p>
    </div>
  )
}