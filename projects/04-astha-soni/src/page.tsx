'use client';

import { useState, useCallback } from 'react';

const CUISINES = [
  'Italian',
  'Indian',
  'Thai',
  'Mexican',
  'Japanese',
  'French',
  'Greek',
  'Korean',
  'Vietnamese',
  'Mediterranean',
] as const;

const DIETS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto', 'Gluten-Free'] as const;

const APPLIANCES = ['Oven', 'Air Fryer', 'Stovetop'] as const;

type RemixResult = {
  title: string;
  ingredients: string[];
  steps: string[];
};

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cuisine, setCuisine] = useState<string>(CUISINES[0]);
  const [diet, setDiet] = useState<string[]>([]);
  const [appliance, setAppliance] = useState<string>(APPLIANCES[0]);
  const [result, setResult] = useState<RemixResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDiet = (d: string) => {
    setDiet((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
      setImageFile(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
      setImageFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleRemix = async () => {
    if (!image) {
      setError('Please upload a recipe image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Send base64 (after data URL prefix) - API will reconstruct for OpenAI
      const base64 = image.includes(',') ? image.split(',')[1] : image;
      const res = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          cuisine,
          diet,
          appliance,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Remix failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `${result.title}\n\nIngredients:\n${result.ingredients.map((i) => `• ${i}`).join('\n')}\n\nSteps:\n${result.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  const downloadAsText = () => {
    if (!result) return;
    const text = `${result.title}\n\nIngredients:\n${result.ingredients.map((i) => `• ${i}`).join('\n')}\n\nSteps:\n${result.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold text-stone-800 tracking-tight"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            Recipe Remix
          </h1>
          <p className="mt-2 text-lg text-stone-600">
            Turn any recipe into your vibe
          </p>
        </header>

        {/* Upload Card */}
        <section
          className="mb-8 rounded-2xl bg-white/80 backdrop-blur shadow-lg border border-stone-200/60 p-6 sm:p-8"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <h2 className="text-lg font-semibold text-stone-700 mb-4">
            Upload Recipe
          </h2>
          <label
            className={`flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? 'border-lavender-500 bg-lavender-500/10'
                : 'border-stone-300 hover:border-lavender-400 hover:bg-stone-50/50'
            } ${image ? 'overflow-hidden' : ''}`}
          >
            {image ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Recipe preview"
                  className="w-full h-full object-contain p-2"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-stone-500">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Drop a recipe screenshot here or click to browse
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          {imageFile && (
            <p className="mt-2 text-sm text-stone-500">{imageFile.name}</p>
          )}
        </section>

        {/* Controls Panel */}
        <section className="mb-8 rounded-2xl bg-white/80 backdrop-blur shadow-lg border border-stone-200/60 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-4">
            Customize
          </h2>

          {/* Cuisine */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-600 mb-2">
              Cuisine
            </label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-700 shadow-sm focus:border-lavender-500 focus:ring-1 focus:ring-lavender-500"
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-600 mb-2">
              Dietary (optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {DIETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDiet(d)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    diet.includes(d)
                      ? 'bg-lavender-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Appliance */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">
              Appliance
            </label>
            <div className="flex flex-wrap gap-3">
              {APPLIANCES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAppliance(a)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    appliance === a
                      ? 'bg-lavender-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Remix Button */}
        <div className="mb-8">
          <button
            onClick={handleRemix}
            disabled={!image || isLoading}
            className="w-full rounded-xl bg-stone-800 py-4 text-lg font-semibold text-white shadow-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Cooking your remix...
              </>
            ) : (
              'Remix Recipe'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Output Card */}
        {result && (
          <section className="rounded-2xl bg-white/80 backdrop-blur shadow-lg border border-stone-200/60 p-6 sm:p-8 mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2
                className="text-2xl font-bold text-stone-800 flex-1"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                {result.title}
              </h2>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={copyToClipboard}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadAsText}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-2">
                Ingredients
              </h3>
              <ul className="space-y-1">
                {result.ingredients.map((ing, i) => (
                  <li key={i} className="text-stone-700 flex gap-2">
                    <span className="text-lavender-500">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-2">
                Steps
              </h3>
              <ol className="space-y-3">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-stone-700 flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lavender-500 text-white text-sm font-medium flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
