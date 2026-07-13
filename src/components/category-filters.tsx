"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const filters = {
  price: [
    ["", "Price"],
    ["under-50", "Under $50"],
    ["50-150", "$50 to $150"],
    ["150-plus", "$150+"]
  ],
  store: [
    ["", "Store"],
    ["walmart", "Walmart"],
    ["target", "Target"],
    ["amazon", "Amazon"],
    ["wayfair", "Wayfair"]
  ],
  brand: [
    ["", "Brand"],
    ["Ninja", "Ninja"],
    ["Samsung", "Samsung"],
    ["Dyson", "Dyson"],
    ["Better Homes & Gardens", "Better Homes & Gardens"],
    ["Levi Strauss", "Levi Strauss"]
  ],
  discount: [
    ["", "Discount"],
    ["20", "20%+"],
    ["40", "40%+"],
    ["clearance", "Clearance"]
  ],
  sort: [
    ["featured", "Sort: Featured"],
    ["lowest-price", "Lowest Price"],
    ["highest-discount", "Highest Discount"],
    ["top-rated", "Top Rated"]
  ]
};

export function CategoryFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="filter-bar" aria-label="Deal filters">
      {Object.entries(filters).map(([name, options]) => (
        <select aria-label={`${name} filter`} value={searchParams.get(name) ?? (name === "sort" ? "featured" : "")} onChange={(event) => updateFilter(name, event.target.value)} key={name}>
          {options.map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      ))}
    </section>
  );
}
