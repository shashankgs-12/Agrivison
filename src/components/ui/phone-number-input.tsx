"use client";

import { useMemo, useState } from "react";
import { Phone } from "lucide-react";
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
  const countryCode = countryOverride ?? countryForNumber(value)?.code ?? "IN";
  const selectedCountry = useMemo(
    () => COUNTRIES.find((country) => country.code === countryCode) ?? COUNTRIES[0],
    [countryCode]
  );

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
    <div className="flex w-full items-stretch">
      <label className="sr-only" htmlFor={`${id}-country`}>
        Country calling code
      </label>
      <select
        id={`${id}-country`}
        aria-label="Country calling code"
        value={countryCode}
        onChange={(event) => selectCountry(event.target.value)}
        disabled={disabled}
        className="h-11 min-h-[44px] w-[7.2rem] shrink-0 touch-manipulation rounded-l-lg border border-r-0 border-slate-200 bg-white px-2 text-base text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.dial} {country.name}
          </option>
        ))}
      </select>
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
