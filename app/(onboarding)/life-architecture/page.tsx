"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Home,
  GraduationCap,
  Briefcase,
  Utensils,
  ArrowRight,
  CheckCircle2,
  Building2,
  Plane,
  Circle,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schema
// ─────────────────────────────────────────────────────────────────────────────
const lifeArchitectureSchema = z.object({
  pincode: z
    .string()
    .min(6, "Pincode must be 6 digits")
    .max(6, "Pincode must be 6 digits")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  city: z.string().min(1, "Please select a city"),
  relocationPreference: z.enum([
    "within-city",
    "same-state",
    "pan-india",
    "abroad-ready",
  ]),
  familyStructure: z.enum([
    "living-with-parents",
    "joint-family",
    "independent",
    "hostel",
  ]),
  education: z.string().min(1, "Please select your education"),
  careerField: z.string().min(1, "Please select your career field"),
  dietaryPreferences: z
    .array(
      z.enum([
        "strict-vegetarian",
        "eggetarian",
        "non-veg",
        "jain",
        "halal-conscious",
      ]),
    )
    .min(1, "Please select at least one dietary preference"),
});

type LifeArchitectureForm = z.infer<typeof lifeArchitectureSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Indian Data
// ─────────────────────────────────────────────────────────────────────────────
const indianCities = [
  { pincode: "110001", city: "New Delhi", state: "Delhi" },
  { pincode: "400001", city: "Mumbai", state: "Maharashtra" },
  { pincode: "560001", city: "Bangalore", state: "Karnataka" },
  { pincode: "600001", city: "Chennai", state: "Tamil Nadu" },
  { pincode: "700001", city: "Kolkata", state: "West Bengal" },
  { pincode: "500001", city: "Hyderabad", state: "Telangana" },
  { pincode: "380001", city: "Ahmedabad", state: "Gujarat" },
  { pincode: "411001", city: "Pune", state: "Maharashtra" },
  { pincode: "302001", city: "Jaipur", state: "Rajasthan" },
  { pincode: "226001", city: "Lucknow", state: "Uttar Pradesh" },
  { pincode: "452001", city: "Indore", state: "Madhya Pradesh" },
  { pincode: "682001", city: "Kochi", state: "Kerala" },
  { pincode: "751001", city: "Bhubaneswar", state: "Odisha" },
  { pincode: "160001", city: "Chandigarh", state: "Chandigarh" },
  { pincode: "141001", city: "Ludhiana", state: "Punjab" },
  { pincode: "201301", city: "Noida", state: "Uttar Pradesh" },
  { pincode: "560100", city: "Electronic City", state: "Karnataka" },
  { pincode: "400076", city: "Powai", state: "Maharashtra" },
  { pincode: "600113", city: "Adyar", state: "Tamil Nadu" },
  { pincode: "500081", city: "Gachibowli", state: "Telangana" },
] as const;

const indianUniversities = [
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Guwahati",
  "IIT Roorkee",
  "IIT Hyderabad",
  "IISc Bangalore",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Warangal",
  "BITS Pilani",
  "VIT Vellore",
  "Manipal Institute of Technology",
  "Delhi University",
  "Mumbai University",
  "Anna University",
  "JNU New Delhi",
  "Jamia Millia Islamia",
  "Aligarh Muslim University",
  "Banaras Hindu University",
  "University of Hyderabad",
  "Pune University",
  "Calcutta University",
  "Madras University",
  "Other Indian University",
  "Foreign University",
] as const;

const careerFields = [
  { id: "it-software", label: "IT / Software", icon: "💻" },
  { id: "govt-services", label: "Government Services", icon: "🏛️" },
  { id: "healthcare", label: "Healthcare / Medical", icon: "🏥" },
  { id: "engineering", label: "Engineering / Manufacturing", icon: "⚙️" },
  { id: "finance", label: "Finance / Banking", icon: "💰" },
  { id: "education", label: "Education / Teaching", icon: "📚" },
  { id: "law", label: "Law / Legal", icon: "⚖️" },
  { id: "media-entertainment", label: "Media / Entertainment", icon: "🎬" },
  { id: "hospitality", label: "Hospitality / Tourism", icon: "🏨" },
  { id: "retail-sales", label: "Retail / Sales", icon: "🛍️" },
  { id: "entrepreneur", label: "Entrepreneur / Business Owner", icon: "🚀" },
  { id: "creative-arts", label: "Creative Arts / Design", icon: "🎨" },
  { id: "research", label: "Research / Academia", icon: "🔬" },
  { id: "non-profit", label: "Non-Profit / Social Work", icon: "🤝" },
  { id: "student", label: "Student", icon: "📖" },
  { id: "other", label: "Other", icon: "📁" },
] as const;

const relocationOptions = [
  { id: "within-city", label: "Within current city", icon: Building2 },
  { id: "same-state", label: "Same state", icon: MapPin },
  { id: "pan-india", label: "Pan-India", icon: Home },
  { id: "abroad-ready", label: "Open to abroad", icon: Plane },
] as const;

const familyStructureOptions = [
  {
    id: "living-with-parents",
    label: "Living with parents",
    desc: "Traditional joint setup",
  },
  {
    id: "joint-family",
    label: "Joint family",
    desc: "Extended family members",
  },
  {
    id: "independent",
    label: "Independent / Nuclear",
    desc: "Living alone or with spouse",
  },
  {
    id: "hostel",
    label: "Hostel / PG",
    desc: "Student or working professional",
  },
] as const;

const dietaryOptions = [
  {
    id: "strict-vegetarian",
    label: "Strict Vegetarian",
    desc: "No meat, eggs, or fish",
  },
  { id: "eggetarian", label: "Eggetarian", desc: "Vegetarian + eggs" },
  { id: "non-veg", label: "Non-Vegetarian", desc: "Eats all types of food" },
  { id: "jain", label: "Jain", desc: "No root vegetables" },
  {
    id: "halal-conscious",
    label: "Halal Conscious",
    desc: "Prefers halal meat",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function LifeArchitecturePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<
    typeof indianCities | []
  >([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<LifeArchitectureForm>({
    resolver: zodResolver(lifeArchitectureSchema),
    mode: "onChange",
    defaultValues: {
      pincode: "",
      city: "",
      dietaryPreferences: [],
    },
  });

  const pincodeValue = watch("pincode");
  const dietaryPreferences = watch("dietaryPreferences");

  // Auto-suggest city based on pincode
  useEffect(() => {
    if (pincodeValue && pincodeValue.length === 6) {
      const matches = indianCities.filter((c) => c.pincode === pincodeValue);
      setCitySuggestions(matches);

      if (matches.length === 1) {
        setValue("city", matches[0].city);
      }
    } else {
      setCitySuggestions([]);
    }
  }, [pincodeValue, setValue]);

  const handleCitySelect = (city: string) => {
    setValue("city", city, { shouldValidate: true });
    setShowCityDropdown(false);
  };

  const handleDietaryToggle = (preference: string) => {
    const current = dietaryPreferences || [];
    const updated = current.includes(preference as any)
      ? current.filter((p) => p !== preference)
      : [...current, preference as any];
    setValue("dietaryPreferences", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: LifeArchitectureForm) => {
    setIsSubmitting(true);

    try {
      // Store onboarding data
      const onboardingData = JSON.parse(
        localStorage.getItem("onboarding_data") || "{}",
      );
      onboardingData.lifeArchitecture = data;
      localStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

      // Navigate to next step
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/onboarding/relationship-preferences");
    } catch (error) {
      console.error("Error saving life architecture:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom overflow-y-auto">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-8"
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
            <MapPin className="w-5 h-5 text-gradient-brand" />
          </div>
          <span className="text-sm font-medium text-midnight-300">
            Step 2 of 3
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient-brand mb-2">
          Life Architecture
        </h1>
        <p className="text-midnight-300 text-sm sm:text-base">
          Tell us about your life and preferences
        </p>
        <p className="text-midnight-400 text-xs mt-1 hindi-text">
          अपनी जीवन शैली और प्राथमिकताएं बताएं
        </p>
      </motion.header>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 space-y-6 pb-24"
      >
        {/* Location Section */}
        <section className="glass-md rounded-2xl p-5 sm:p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-midnight-50 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-violet-400" />
            <span>Location</span>
          </h2>

          <div className="space-y-4">
            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-midnight-200 mb-2">
                Pincode <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit pincode"
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border",
                  "text-midnight-50 placeholder:text-midnight-400",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                  errors.pincode
                    ? "border-error/50 focus:border-error/50"
                    : "border-white/10 focus:border-violet-500/50",
                )}
                {...register("pincode")}
              />
              {errors.pincode && (
                <p className="mt-1 text-xs text-error">
                  {errors.pincode.message}
                </p>
              )}
            </div>

            {/* City Auto-suggest */}
            <div className="relative">
              <label className="block text-sm font-medium text-midnight-200 mb-2">
                City <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder={
                  pincodeValue?.length === 6
                    ? "Select city"
                    : "Enter pincode first"
                }
                readOnly
                onFocus={() =>
                  pincodeValue?.length === 6 && setShowCityDropdown(true)
                }
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border",
                  "text-midnight-50 placeholder:text-midnight-400",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer",
                  errors.city ? "border-error/50" : "border-white/10",
                )}
                {...register("city")}
              />
              {showCityDropdown && citySuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 w-full mt-1 glass-dark rounded-xl border border-white/10 overflow-hidden"
                >
                  {citySuggestions.map((suggestion) => (
                    <button
                      key={suggestion.pincode}
                      type="button"
                      onClick={() => handleCitySelect(suggestion.city)}
                      className="w-full px-4 py-3 text-left text-sm text-midnight-200 hover:bg-white/10 transition-colors flex justify-between items-center"
                    >
                      <span>{suggestion.city}</span>
                      <span className="text-xs text-midnight-400">
                        {suggestion.state}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
              {errors.city && (
                <p className="mt-1 text-xs text-error">{errors.city.message}</p>
              )}
            </div>

            {/* Relocation Preference */}
            <div>
              <label className="block text-sm font-medium text-midnight-200 mb-3">
                Relocation Preference <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="relocationPreference"
                  control={control}
                  render={({ field }) => (
                    <div className="col-span-2 grid grid-cols-2 gap-3">
                      {relocationOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = field.value === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => field.onChange(option.id)}
                            className={cn(
                              "relative p-3 rounded-xl border transition-all duration-200",
                              "flex flex-col items-center justify-center space-y-2",
                              isSelected
                                ? "bg-gradient-to-br from-violet-500/20 to-saffron-500/20 border-violet-500/50"
                                : "bg-white/5 border-white/10 hover:border-white/20",
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-4 h-4 text-violet-400" />
                              </div>
                            )}
                            <Icon
                              className={cn(
                                "w-5 h-5",
                                isSelected
                                  ? "text-violet-400"
                                  : "text-midnight-400",
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs font-medium",
                                isSelected
                                  ? "text-midnight-50"
                                  : "text-midnight-300",
                              )}
                            >
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
              {errors.relocationPreference && (
                <p className="mt-1 text-xs text-error">
                  {errors.relocationPreference.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Family & Background Section */}
        <section className="glass-md rounded-2xl p-5 sm:p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-midnight-50 mb-4 flex items-center space-x-2">
            <Home className="w-5 h-5 text-violet-400" />
            <span>Family & Background</span>
          </h2>

          <div className="space-y-4">
            {/* Family Structure */}
            <div>
              <label className="block text-sm font-medium text-midnight-200 mb-3">
                Family Structure <span className="text-rose-400">*</span>
              </label>
              <div className="space-y-2">
                <Controller
                  name="familyStructure"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {familyStructureOptions.map((option) => (
                        <label
                          key={option.id}
                          className={cn(
                            "flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                            field.value === option.id
                              ? "bg-violet-500/10 border-violet-500/30"
                              : "bg-white/5 border-white/10 hover:border-white/20",
                          )}
                        >
                          <input
                            type="radio"
                            value={option.id}
                            checked={field.value === option.id}
                            onChange={() => field.onChange(option.id)}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                              field.value === option.id
                                ? "border-violet-500 bg-violet-500"
                                : "border-midnight-400",
                            )}
                          >
                            {field.value === option.id && (
                              <Circle
                                className="w-2.5 h-2.5 text-white"
                                fill="currentColor"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                field.value === option.id
                                  ? "text-midnight-50"
                                  : "text-midnight-200",
                              )}
                            >
                              {option.label}
                            </p>
                            <p className="text-xs text-midnight-400">
                              {option.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
              {errors.familyStructure && (
                <p className="mt-1 text-xs text-error">
                  {errors.familyStructure.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Education & Career Section */}
        <section className="glass-md rounded-2xl p-5 sm:p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-midnight-50 mb-4 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-violet-400" />
            <span>Education & Career</span>
          </h2>

          <div className="space-y-4">
            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-midnight-200 mb-2">
                Education <span className="text-rose-400">*</span>
              </label>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-white/5 border appearance-none",
                        "text-midnight-50",
                        "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                        errors.education
                          ? "border-error/50"
                          : "border-white/10",
                      )}
                    >
                      <option value="">Select your university/college</option>
                      {indianUniversities.map((uni) => (
                        <option
                          key={uni}
                          value={uni}
                          className="bg-midnight-900"
                        >
                          {uni}
                        </option>
                      ))}
                    </select>
                    <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400 pointer-events-none" />
                  </div>
                )}
              />
              {errors.education && (
                <p className="mt-1 text-xs text-error">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Career Field */}
            <div>
              <label className="block text-sm font-medium text-midnight-200 mb-2">
                Career Field <span className="text-rose-400">*</span>
              </label>
              <Controller
                name="careerField"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {careerFields.map((career) => (
                      <button
                        key={career.id}
                        type="button"
                        onClick={() => field.onChange(career.id)}
                        className={cn(
                          "p-3 rounded-xl border transition-all duration-200",
                          "flex flex-col items-center justify-center space-y-1",
                          field.value === career.id
                            ? "bg-gradient-to-br from-saffron-500/20 to-violet-500/20 border-saffron-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20",
                        )}
                      >
                        <span className="text-lg">{career.icon}</span>
                        <span
                          className={cn(
                            "text-xs font-medium text-center",
                            field.value === career.id
                              ? "text-midnight-50"
                              : "text-midnight-300",
                          )}
                        >
                          {career.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.careerField && (
                <p className="mt-1 text-xs text-error">
                  {errors.careerField.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Dietary Preferences Section */}
        <section className="glass-md rounded-2xl p-5 sm:p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-midnight-50 mb-4 flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-violet-400" />
            <span>Dietary Preferences</span>
          </h2>

          <div>
            <Controller
              name="dietaryPreferences"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {dietaryOptions.map((option) => {
                    const isSelected = field.value?.includes(option.id as any);
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-white/5 border-white/10 hover:border-white/20",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDietaryToggle(option.id)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "w-5 h-5 rounded flex items-center justify-center border-2 mt-0.5",
                            isSelected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-midnight-400",
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isSelected
                                ? "text-midnight-50"
                                : "text-midnight-200",
                            )}
                          >
                            {option.label}
                          </p>
                          <p className="text-xs text-midnight-400">
                            {option.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {errors.dietaryPreferences && (
              <p className="mt-1 text-xs text-error">
                {errors.dietaryPreferences.message}
              </p>
            )}
          </div>
        </section>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !isValid}
          whileHover={{ scale: isSubmitting || !isValid ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting || !isValid ? 1 : 0.98 }}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-white",
            "flex items-center justify-center space-x-2",
            "transition-all duration-300",
            isValid && !isSubmitting
              ? "bg-gradient-to-r from-saffron-500 to-violet-500 hover:shadow-saffron-glow"
              : "bg-midnight-700/50 cursor-not-allowed opacity-50",
          )}
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}
