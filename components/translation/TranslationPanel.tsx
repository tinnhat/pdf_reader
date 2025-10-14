'use client'

import { FormEvent, useEffect, useState } from 'react'

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
]

interface TranslationPanelProps {
  selectedText?: string
}

export function TranslationPanel({ selectedText }: TranslationPanelProps) {
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [targetLanguage, setTargetLanguage] = useState('vi')
  const [text, setText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedText) {
      setText(selectedText)
    }
  }, [selectedText])

  async function handleTranslate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!text.trim()) {
      setError('Vui lòng nhập nội dung cần dịch')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        }),
      })

      if (!response.ok) {
        const json = await response.json()
        throw new Error(json.error ?? 'Yêu cầu dịch thất bại')
      }

      const json = (await response.json()) as { translation: string }

      setTranslatedText(json.translation)
    } catch (translateError) {
      console.error(translateError)
      setError(
        translateError instanceof Error
          ? translateError.message
          : 'Không thể kết nối tới dịch vụ dịch'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='glass-panel flex flex-col gap-4 p-6 text-sm text-slate-600 dark:text-slate-200'>
      <div>
        <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Dịch nhanh</h2>
        <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
          Sử dụng LibreTranslate thông qua API nội bộ để chuyển ngữ tức thì.
        </p>
      </div>
      <form className='space-y-4' onSubmit={handleTranslate}>
        <div className='flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
          <label className='flex flex-col gap-1'>
            Ngôn ngữ nguồn
            <select
              value={sourceLanguage}
              onChange={event => setSourceLanguage(event.target.value)}
              className='rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/30'
            >
              <option value='auto'>Tự động</option>
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
          <label className='flex flex-col gap-1'>
            Ngôn ngữ đích
            <select
              value={targetLanguage}
              onChange={event => setTargetLanguage(event.target.value)}
              className='rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/30'
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          rows={4}
          placeholder='Dán hoặc chọn nội dung từ tài liệu để dịch...'
          className='w-full rounded-lg border border-slate-200/70 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700/70 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/30'
        />
        <button
          type='submit'
          disabled={isLoading}
          className='w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-wait disabled:opacity-70'
        >
          {isLoading ? 'Đang dịch...' : 'Dịch ngay'}
        </button>
      </form>
      {error ? (
        <p className='rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300'>
          {error}
        </p>
      ) : null}
      {translatedText ? (
        <article className='rounded-xl border border-emerald-400/50 bg-emerald-50/80 p-4 text-sm text-emerald-900 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100'>
          <h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200'>
            Kết quả
          </h3>
          <p className='whitespace-pre-line leading-relaxed'>{translatedText}</p>
        </article>
      ) : null}
    </section>
  )
}
