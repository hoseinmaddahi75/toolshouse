"use client";

import { useState, useEffect } from "react";
import { getTapinLocations } from "@/app/checkout/tapin-actions";
import { Loader2 } from "lucide-react";

interface TapinProvinceCitySelectorProps {
  defaultProvince?: string;
  defaultCity?: string;
  provinceFieldName?: string;
  cityFieldName?: string;
  onProvinceChange?: (province: string) => void;
  onCityChange?: (city: string) => void;
}

export default function TapinProvinceCitySelector({
  defaultProvince = "",
  defaultCity = "",
  provinceFieldName = "shipping_address.province",
  cityFieldName = "shipping_address.city",
  onProvinceChange,
  onCityChange,
}: TapinProvinceCitySelectorProps) {
  
  // نگهداری کل درخت استان‌ها و شهرها
  const [locations, setLocations] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const [selectedProvince, setSelectedProvince] = useState(defaultProvince);
  const [selectedCity, setSelectedCity] = useState(defaultCity);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      const data = await getTapinLocations();
      setLocations(Array.isArray(data) ? data : []); 
      setLoading(false);
    };
    fetchLocations();
  }, []);

  const safeLocations = Array.isArray(locations) ? locations : [];
  const activeProvinceObj = safeLocations.find(p => p.title === selectedProvince);
  const cities = activeProvinceObj?.cities || [];

  // 💡 همگام‌سازی استان فقط زمانی که واقعاً از سمت کامپوننت پدر تغییر کرده باشد
  useEffect(() => {
    if (defaultProvince !== undefined && defaultProvince !== selectedProvince) {
      setSelectedProvince(defaultProvince);
    }
  }, [defaultProvince]);

  // 💡 همگام‌سازی شهر
  useEffect(() => {
    if (defaultCity !== undefined && defaultCity !== selectedCity) {
      setSelectedCity(defaultCity);
    }
  }, [defaultCity]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProvince(val);
    setSelectedCity(""); // ریست کردن شهر با تغییر استان
    
    if (onProvinceChange) onProvinceChange(val);
    if (onCityChange) onCityChange(""); 
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCity(val);
    if (onCityChange) onCityChange(val);
  };

  return (
    <>
      <div className="space-y-1 relative">
        <label className="text-sm font-medium text-gray-700">استان <span className="text-red-500">*</span></label>
        <div className="relative">
            <select
              name={provinceFieldName}
              value={selectedProvince}
              onChange={handleProvinceChange}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              <option value="" disabled>انتخاب استان...</option>
              {locations.map((p) => (
                <option key={p.code} value={p.title}>{p.title}</option>
              ))}
            </select>
            {loading && <Loader2 className="absolute left-3 top-3 w-4 h-4 animate-spin text-gray-400" />}
        </div>
      </div>

      <div className="space-y-1 relative">
        <label className="text-sm font-medium text-gray-700">شهر <span className="text-red-500">*</span></label>
        <div className="relative">
            <select
              name={cityFieldName}
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedProvince || loading}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              <option value="" disabled>
                {!selectedProvince ? "ابتدا استان را انتخاب کنید" : "انتخاب شهر..."}
              </option>
              {cities.map((c: any) => (
                <option key={c.code} value={c.title}>{c.title}</option>
              ))}
            </select>
        </div>
      </div>
    </>
  );
}