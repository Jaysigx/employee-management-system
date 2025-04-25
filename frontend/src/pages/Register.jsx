import {
  useEffect,
  useState,
} from 'react';

import {
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import InfinityParticles from '../components/InfinityParticles';

const provinces = [
  { code: "ON", name: "Ontario" },
  { code: "QC", name: "Quebec" },
  { code: "BC", name: "British Columbia" },
  { code: "AB", name: "Alberta" },
  { code: "MB", name: "Manitoba" },
  { code: "SK", name: "Saskatchewan" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "NT", name: "Northwest Territories" },
  { code: "YT", name: "Yukon" },
  { code: "NU", name: "Nunavut" },
];

const provinceNameToCode = Object.fromEntries(
  provinces.map(({ code, name }) => [name.toLowerCase(), code])
);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: {
      street: "",
      city: "",
      province: "",
      country: "Canada",
      postalCode: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [autoFilled, setAutoFilled] = useState({
    city: false,
    province: false,
  });
  const [isPostalValid, setIsPostalValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[\W_]/.test(password)) strength++;

    if (strength <= 1) return "Weak";
    if (strength === 2 || strength === 3) return "Medium";
    return "Strong";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in form.address) {
      setForm({ ...form, address: { ...form.address, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (name === "postalCode") {
      setAutoFilled({ city: false, province: false });
      setIsPostalValid(false);
    }

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      address,
    } = form;

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    if (!address.street.trim())
      newErrors.street = "Street address is required.";
    if (!address.city.trim()) newErrors.city = "City is required.";
    if (!address.province.trim()) newErrors.province = "Province is required.";
    if (!address.postalCode.trim())
      newErrors.postalCode = "Postal code is required.";
    if (!password.trim()) newErrors.password = "Password is required.";
    else if (!passwordRegex.test(password)) {
      newErrors.password = "Password is not strong enough.";
    }
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!isPostalValid)
      newErrors.postalCode = "Postal code must auto-fill city & province.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      Object.keys(errors).length === 0 &&
      form.firstName &&
      form.lastName &&
      form.email &&
      form.phone &&
      form.password &&
      form.confirmPassword &&
      form.address.street &&
      form.address.city &&
      form.address.province &&
      form.address.postalCode &&
      isPostalValid &&
      passwordRegex.test(form.password) &&
      form.password === form.confirmPassword
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Account created (placeholder)");
      navigate("/login");
    }
  };

  useEffect(() => {
    const lookupPostalCode = async () => {
      const cleaned = form.address.postalCode.replace(/\s/g, "").toUpperCase();
      if (cleaned.length >= 3) {
        const fsa = cleaned.slice(0, 3);
        try {
          const res = await fetch(`https://api.zippopotam.us/ca/${fsa}`);
          if (!res.ok) throw new Error("Invalid postal code");

          const data = await res.json();
          const place = data.places?.[0];
          const city = place["place name"];
          const provinceCode =
            provinceNameToCode[place["state"].toLowerCase()] || "";

          setForm((prev) => ({
            ...prev,
            address: { ...prev.address, city, province: provinceCode },
          }));
          setAutoFilled({ city: true, province: true });
          setIsPostalValid(true);
        } catch {
          setAutoFilled({ city: false, province: false });
          setIsPostalValid(false);
        }
      } else {
        setAutoFilled({ city: false, province: false });
        setIsPostalValid(false);
      }
    };

    lookupPostalCode();
  }, [form.address.postalCode]);

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white">
      <InfinityParticles />
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-8 w-full max-w-2xl shadow-xl z-10">
        <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="w-1/2">
              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="w-1/2">
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <input
            name="street"
            placeholder="Street Address"
            value={form.address.street}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          />
          {errors.street && (
            <p className="text-red-400 text-sm mt-1">{errors.street}</p>
          )}

          {/* Province */}
          <select
            name="province"
            value={form.address.province}
            onChange={handleChange}
            disabled={autoFilled.province}
            className={`w-full px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none ${
              autoFilled.province ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="">Select Province</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="text-red-400 text-sm mt-1">{errors.province}</p>
          )}

          {/* City */}
          <input
            name="city"
            placeholder="City"
            value={form.address.city}
            onChange={handleChange}
            disabled={autoFilled.city}
            className={`w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none ${
              autoFilled.city ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          {errors.city && (
            <p className="text-red-400 text-sm mt-1">{errors.city}</p>
          )}

          {/* Postal Code */}
          <input
            name="postalCode"
            placeholder="Postal Code"
            value={form.address.postalCode}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          />
          {errors.postalCode && (
            <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>
          )}

          <input
            name="country"
            value="Canada"
            disabled
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
          />

          {/* Password requirements */}
          <p className="text-white/60 text-sm">
            Password must be at least 8 characters and include uppercase,
            lowercase, number, and special character.
          </p>

          {/* Passwords */}
          <div className="flex gap-4">
            {/* Password field */}
            <div className="w-1/2 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {/* Password Strength Bar */}
              {form.password && (
                <div className="mt-1">
                  <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
                    <div
                      className={`h-2 transition-all ${
                        passwordStrength === "Weak"
                          ? "bg-red-500 w-1/3"
                          : passwordStrength === "Medium"
                          ? "bg-yellow-400 w-2/3"
                          : passwordStrength === "Strong"
                          ? "bg-green-500 w-full"
                          : "w-0"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      passwordStrength === "Weak"
                        ? "text-red-400"
                        : passwordStrength === "Medium"
                        ? "text-yellow-300"
                        : "text-green-400"
                    }`}
                  >
                    Strength: {passwordStrength}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="w-1/2 relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full mt-4 py-2 rounded-lg font-medium transition ${
              isFormValid()
                ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                : "bg-white/20 text-white/50 cursor-not-allowed"
            }`}
            disabled={!isFormValid()}
          >
            Register →
          </button>

          <p className="mt-4 text-center text-sm text-white/70">
            Already have an account?{" "}
            <span
              className="text-cyan-400 hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
