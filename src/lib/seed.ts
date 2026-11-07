import { toISODate } from './format'
import type { Debt, Payment } from './types'

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toISODate(date)
}

function daysAhead(days: number): string {
  return daysAgo(-days)
}

function payment(days: number, amount: number, note?: string): Payment {
  return {
    id: crypto.randomUUID(),
    amount,
    date: daysAgo(days),
    note,
  }
}

/** Демо-данные: показывают все статусы, направления и валюты */
export function createDemoDebts(): Debt[] {
  const now = new Date().toISOString()

  return [
    {
      id: crypto.randomUUID(),
      direction: 'owe',
      title: 'Кредитка Т-Банк',
      kind: 'bank',
      counterparty: 'Т-Банк',
      amount: 120_000,
      currency: 'RUB',
      description: 'Закрыл овердрафт, минимальный платёж 15 000 ₽ до 10 числа',
      dueDate: daysAhead(38),
      contact: {
        note: 'Автоплатёж 10 числа, личный кабинет в приложении банка',
      },
      createdAt: now,
      payments: [payment(45, 30_000, 'Первый платёж'), payment(12, 15_000)],
    },
    {
      id: crypto.randomUUID(),
      direction: 'owe',
      title: 'Долг Андрею',
      kind: 'person',
      counterparty: 'Андрей Соколов',
      amount: 50_000,
      currency: 'RUB',
      description: 'Одалжал на ремонт кухни, обещал вернуть частями',
      dueDate: daysAhead(6),
      contact: {
        phone: '+7 999 123-45-67',
        telegram: '@sokolov_a',
        note: 'Лучше звонить вечером, пишет в телеграм',
      },
      createdAt: now,
      payments: [payment(30, 15_000, 'Первая часть')],
    },
    {
      id: crypto.randomUUID(),
      direction: 'owe',
      title: 'Рассрочка в М.Видео',
      kind: 'other',
      counterparty: 'М.Видео',
      amount: 24_000,
      currency: 'RUB',
      description: 'Холодильник в 4 беспроцентные платежа',
      dueDate: daysAgo(3),
      contact: { note: 'Оплата в приложении магазина' },
      createdAt: now,
      payments: [payment(60, 8_000), payment(30, 8_000)],
    },
    {
      id: crypto.randomUUID(),
      direction: 'owed',
      title: 'Кирилл должен',
      kind: 'person',
      counterparty: 'Кирилл Волков',
      amount: 300,
      currency: 'USD',
      description: 'Одалжил на командировку, вернёт после аванса',
      dueDate: daysAhead(24),
      contact: {
        phone: '+1 555 018 2233',
        telegram: '@volkov_k',
        email: 'volkov@example.com',
      },
      createdAt: now,
      payments: [payment(20, 100, 'Вернул часть')],
    },
    {
      id: crypto.randomUUID(),
      direction: 'owed',
      title: 'Займ у Ольги',
      kind: 'person',
      counterparty: 'Ольга Левина',
      amount: 15_000,
      currency: 'RUB',
      description: 'Дала в долг до зарплаты',
      dueDate: daysAgo(9),
      contact: { telegram: '@levina_o' },
      createdAt: now,
      payments: [payment(4, 5_000, 'Частичный возврат')],
    },
  ]
}
