import { useEffect, useRef } from 'react'
import { tradeService } from '../services/tradeService'
import type { Trade, TradeStreamEventType, TradeStreamPayload } from '../types/trade'

const STREAM_EVENTS: TradeStreamEventType[] = [
  'TRADE_CREATED',
  'TRADE_AMENDED',
  'TRADE_CANCELLED',
]

type TradeStreamHandler = (eventType: TradeStreamEventType, trade: Trade) => void

/**
 * Subscribes to the backend's real-time trade stream via Server-Sent Events
 * (GET /trades/stream) and invokes `onTradeEvent` whenever any client
 * creates, amends, or cancels a trade — keeping the blotter in sync across
 * tabs/users without polling.
 *
 * Uses the native `EventSource` API, which auto-reconnects on connection
 * drops, so no manual reconnect logic is implemented here. The connection is
 * opened once per mount and closed on unmount.
 */
export function useTradeStream(onTradeEvent: TradeStreamHandler) {
  // Keep the latest handler in a ref so the effect below doesn't need to
  // depend on it (and therefore doesn't tear down/reopen the connection
  // every time the caller passes a new inline function).
  const handlerRef = useRef(onTradeEvent)

  useEffect(() => {
    handlerRef.current = onTradeEvent
  }, [onTradeEvent])

  useEffect(() => {
    const source = new EventSource(tradeService.getStreamUrl())

    const listeners = STREAM_EVENTS.map((eventName) => {
      const listener = (event: MessageEvent<string>) => {
        try {
          const payload = JSON.parse(event.data) as TradeStreamPayload
          if (payload?.trade) {
            handlerRef.current(eventName, payload.trade)
          }
        } catch {
          // Ignore malformed SSE payloads rather than crashing the stream.
        }
      }

      source.addEventListener(eventName, listener)
      return { eventName, listener }
    })

    source.onerror = () => {
      // EventSource auto-reconnects using the server's retry hint; nothing
      // to do here besides letting it retry silently.
    }

    return () => {
      for (const { eventName, listener } of listeners) {
        source.removeEventListener(eventName, listener)
      }
      source.close()
    }
  }, [])
}
