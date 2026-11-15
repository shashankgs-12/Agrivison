"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Phone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const COUNTRIES = [
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { code: "NP", name: "Nepal", dial: "+977", flag: "🇳🇵" },
  { code: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "TR", name: "Türkiye", dial: "+90", flag: "🇹🇷" },
  { code: "RU", name: "Russia", dial: "+7", flag: "🇷🇺" },
  { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { code: "AF", name: "Afghanistan", dial: "+93", flag: "🇦🇫" },
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "UA", name: "Ukraine", dial: "+380", flag: "🇺🇦" },
] as const;

type Country = (typeof COUNTRIES)[number];
type CountryMenuPosition = {
  left: number;
  width: number;
  offset: number;
  side: "above" | "below";
  maxHeight: number;
};
const POPULAR_COUNTRY_CODES = new Set(["IN", "US", "GB", "AE", "CA"]);
const POPULAR_COUNTRIES = COUNTRIES.filter((country) =>
  POPULAR_COUNTRY_CODES.has(country.code)
);

function countryForNumber(value: string): Country | undefined {
  if (!value.startsWith("+")) return undefined;
  const digits = value.replace(/\D/g, "");
  return [...COUNTRIES]
    .sort((left, right) => right.dial.length - left.dial.length)
    .find((country) => digits.startsWith(country.dial.slice(1)));
}

export function PhoneNumberInput({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Mobile number",
  autoComplete = "tel-national",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [countryOverride, setCountryOverride] = useState<string | null>(null);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [activeCountryCode, setActiveCountryCode] = useState("IN");
  const [countryMenuPosition, setCountryMenuPosition] =
    useState<CountryMenuPosition | null>(null);
  const countryPickerRef = useRef<HTMLDivElement>(null);
  const countryButtonRef = useRef<HTMLButtonElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);
  const countryOptionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const countryCode = countryOverride ?? countryForNumber(value)?.code ?? "IN";
  const selectedCountry = useMemo(
    () => COUNTRIES.find((country) => country.code === countryCode) ?? COUNTRIES[0],
    [countryCode]
  );
  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return COUNTRIES;

    const dialQuery = query.replace(/^\+/, "");
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query) ||
        country.dial.includes(query) ||
        country.dial.slice(1).startsWith(dialQuery)
    );
  }, [countrySearch]);

  useEffect(() => {
    if (!countryMenuOpen) return;

    const updateMenuPosition = () => {
      const button = countryButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const gap = 8;
      const viewportPadding = 12;
      const desiredHeight = 380;
      const spaceAbove = Math.max(0, rect.top - gap - viewportPadding);
      const spaceBelow = Math.max(
        0,
        window.innerHeight - rect.bottom - gap - viewportPadding
      );
      const side =
        spaceBelow >= desiredHeight || spaceBelow >= spaceAbove ? "below" : "above";
      const availableSpace = side === "below" ? spaceBelow : spaceAbove;
      const menuWidth = Math.min(320, Math.max(0, window.innerWidth - 24));

      setCountryMenuPosition({
        left: Math.max(
          12,
          Math.min(rect.left, window.innerWidth - menuWidth - 12)
        ),
        width: menuWidth,
        offset: side === "below" ? rect.bottom + gap : window.innerHeight - rect.top + gap,
        side,
        maxHeight: Math.max(160, Math.min(desiredHeight, availableSpace)),
      });
    };

    updateMenuPosition();
    const frame = window.requestAnimationFrame(() => countrySearchRef.current?.focus());
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!countryPickerRef.current?.contains(event.target as Node)) {
        setCountryMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCountryMenuOpen(false);
        countryButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [countryMenuOpen]);

  const countryDigits = selectedCountry.dial.slice(1);
  const allDigits = value.replace(/\D/g, "");
  const nationalNumber = value.startsWith("+") && allDigits.startsWith(countryDigits)
    ? allDigits.slice(countryDigits.length)
    : allDigits;

  function selectCountry(nextCode: string) {
    const nextCountry = COUNTRIES.find((country) => country.code === nextCode);
    if (!nextCountry) return;
    setCountryOverride(nextCountry.code);
    const localDigits = nationalNumber;
    onChange(localDigits ? `${nextCountry.dial}${localDigits}` : "");
    setCountrySearch("");
    setCountryMenuOpen(false);
    countryButtonRef.current?.focus();
  }

  function moveCountryFocus(currentCode: string, direction: -1 | 1 | "first" | "last") {
    if (filteredCountries.length === 0) return;

    const currentIndex = filteredCountries.findIndex(
      (country) => country.code === currentCode
    );
    const nextIndex =
      direction === "first"
        ? 0
        : direction === "last"
          ? filteredCountries.length - 1
          : (currentIndex + direction + filteredCountries.length) % filteredCountries.length;
    const nextCountry = filteredCountries[nextIndex];
    setActiveCountryCode(nextCountry.code);
    countryOptionRefs.current[nextCountry.code]?.focus();
  }

  function openCountryMenu() {
    setCountrySearch("");
    setActiveCountryCode(selectedCountry.code);
    setCountryMenuOpen((open) => !open);
  }

  function changeNumber(rawValue: string) {
    const pastedCountry = countryForNumber(rawValue.trim());
    const digits = rawValue.replace(/\D/g, "");
    if (pastedCountry) {
      const localDigits = digits.slice(pastedCountry.dial.slice(1).length);
      setCountryOverride(pastedCountry.code);
      onChange(localDigits ? `${pastedCountry.dial}${localDigits}` : "");
      return;
    }
    onChange(digits ? `${selectedCountry.dial}${digits}` : "");
  }

  return (
    <div className={`relative flex w-full items-stretch ${countryMenuOpen ? "z-50" : "z-0"}`}>
      <div
        ref={countryPickerRef}
        className={`relative shrink-0 ${countryMenuOpen ? "z-50" : "z-0"}`}
        onBlurCapture={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            !countryPickerRef.current?.contains(event.relatedTarget)
          ) {
            setCountryMenuOpen(false);
          }
        }}
      >
        <button
          ref={countryButtonRef}
          type="button"
          aria-label={`Country calling code: ${selectedCountry.name} ${selectedCountry.dial}`}
          aria-haspopup="listbox"
          aria-expanded={countryMenuOpen}
          aria-controls={`${id}-country-listbox`}
          disabled={disabled}
          onClick={openCountryMenu}
          className="group flex h-11 min-h-[44px] w-[7.6rem] items-center justify-between gap-2 rounded-l-xl border border-r-0 border-slate-200 bg-gradient-to-br from-white to-emerald-50/70 px-2.5 text-slate-800 shadow-sm transition hover:from-emerald-50 hover:to-emerald-100/80 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/90 dark:text-slate-100 dark:hover:from-slate-800 dark:hover:to-emerald-950/50"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-lg leading-none shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
            {selectedCountry.flag}
          </span>
          <span className="text-sm font-bold tracking-tight">{selectedCountry.dial}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:text-emerald-600 dark:group-hover:text-emerald-300 ${countryMenuOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {countryMenuOpen && countryMenuPosition && (
          <div
            style={{
              position: "fixed",
              left: countryMenuPosition.left,
              width: countryMenuPosition.width,
              top:
                countryMenuPosition.side === "below"
                  ? countryMenuPosition.offset
                  : undefined,
              bottom:
                countryMenuPosition.side === "above"
                  ? countryMenuPosition.offset
                  : undefined,
              maxHeight: countryMenuPosition.maxHeight,
            }}
            className="z-[100] flex max-w-[calc(100vw_-_1.5rem)] flex-col overflow-hidden rounded-2xl border border-emerald-900/20 bg-white shadow-[0_18px_48px_rgba(2,6,23,0.38)] ring-1 ring-black/5 dark:border-slate-700/90 dark:bg-[#0b1220] dark:ring-white/5"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Choose country
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/50 dark:text-emerald-300">
                {COUNTRIES.length} codes
              </span>
            </div>

            <div className="shrink-0 p-2.5 pb-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  ref={countrySearchRef}
                  type="search"
                  aria-label="Search countries or calling codes"
                  placeholder="Search country or +code"
                  value={countrySearch}
                  onChange={(event) => {
                    const query = event.target.value;
                    setCountrySearch(query);
                    const normalized = query.trim().toLowerCase();
                    const dialQuery = normalized.replace(/^\+/, "");
                    const firstMatch = COUNTRIES.find(
                      (country) =>
                        country.name.toLowerCase().includes(normalized) ||
                        country.code.toLowerCase().includes(normalized) ||
                        country.dial.includes(normalized) ||
                        country.dial.slice(1).startsWith(dialQuery)
                    );
                    setActiveCountryCode(firstMatch?.code ?? "");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" && filteredCountries.length > 0) {
                      event.preventDefault();
                      const selectedMatch = filteredCountries.find(
                        (country) => country.code === selectedCountry.code
                      );
                      const firstCountry = selectedMatch ?? filteredCountries[0];
                      setActiveCountryCode(firstCountry.code);
                      countryOptionRefs.current[firstCountry.code]?.focus();
                    }
                  }}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="shrink-0 px-2.5 pb-2">
              <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                Popular
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {POPULAR_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    title={`${country.name} ${country.dial}`}
                    onClick={() => selectCountry(country.code)}
                    className={`inline-flex min-h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      selectedCountry.code === country.code
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/70 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40"
                    }`}
                  >
                    <span className="text-sm leading-none">{country.flag}</span>
                    {country.dial}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-3.5 py-1.5 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                {countrySearch ? "Search results" : "All countries"}
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {filteredCountries.length} found
              </span>
            </div>

            <div
              id={`${id}-country-listbox`}
              role="listbox"
              aria-label="Countries"
              className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 pt-0"
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  const selected = selectedCountry.code === country.code;
                  const active = activeCountryCode === country.code;
                  return (
                    <button
                      key={country.code}
                      ref={(element) => {
                        countryOptionRefs.current[country.code] = element;
                      }}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      tabIndex={active ? 0 : -1}
                      onFocus={() => setActiveCountryCode(country.code)}
                      onMouseEnter={() => setActiveCountryCode(country.code)}
                      onClick={() => selectCountry(country.code)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          moveCountryFocus(country.code, 1);
                        } else if (event.key === "ArrowUp") {
                          event.preventDefault();
                          moveCountryFocus(country.code, -1);
                        } else if (event.key === "Home") {
                          event.preventDefault();
                          moveCountryFocus(country.code, "first");
                        } else if (event.key === "End") {
                          event.preventDefault();
                          moveCountryFocus(country.code, "last");
                        }
                      }}
                      className={`group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
                        selected
                          ? "bg-emerald-50 text-slate-900 dark:bg-emerald-950/50 dark:text-white"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg leading-none ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
                        {country.flag}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {country.name}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {country.dial}
                      </span>
                      {selected && (
                        <Check
                          className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center px-4 py-7 text-center">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <Globe className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No country found
                  </span>
                  <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Try a country name or calling code
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        required={required}
        maxLength={18}
        placeholder={placeholder}
        value={nationalNumber}
        onChange={(event) => changeNumber(event.target.value)}
        disabled={disabled}
        icon={<Phone className="h-4 w-4" />}
        className="h-11 min-h-[44px] min-w-0 touch-manipulation rounded-l-none text-base sm:text-sm"
      />
    </div>
  );
}
