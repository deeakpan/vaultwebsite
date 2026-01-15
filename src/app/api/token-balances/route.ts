import { NextResponse } from 'next/server'
import axios from 'axios'
import https from 'https'

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  const apiUrl = `https://explorer-pepu-v2-mainnet-0.t.conduit.xyz` +
                 `/api/v2/addresses/${address}/token-balances`

  try {
    const resp = await axios.get(apiUrl, { httpsAgent })

    // Use resp.data if it's already an array, otherwise fall back
    const items = Array.isArray(resp.data)
      ? resp.data
      : Array.isArray(resp.data.items)
        ? resp.data.items
        : []

    const balances = items.map((i: any) => ({
      address:    i.token.address_hash || i.token.address,
      symbol:     i.token.symbol,
      name:       i.token.name,
      rawBalance: i.value,
      decimals:   Number(i.token.decimals),
    }))

    return NextResponse.json({ balances })
  } catch (err) {
    console.error('[proxy] token-balances error', err)
    return NextResponse.json(
      { error: 'Failed to fetch token balances' },
      { status: 502 }
    )
  }
}
