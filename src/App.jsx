import { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Sprout,
  LogOut,
  LayoutDashboard,
  Package,
  Inbox,
  Search,
  ClipboardList,
  Handshake,
  CheckCircle2,
  MapPin,
  CalendarDays
} from "lucide-react";

// ---------- Mock data (replace with API calls later) ----------

// ---------- State ----------
const Ctx = createContext();
const useApp = () => useContext(Ctx);
const uid = () => Math.random().toString(36).slice(2, 8);
const btn = "inline-flex items-center justify-center gap-1 bg-green-700 text-white px-4 py-2.5 rounded-xl hover:bg-green-800 text-sm font-medium shadow-sm transition";
const btn2 = "inline-flex items-center justify-center gap-1 border border-green-700 text-green-800 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition";
const inp = "w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-600";
const cardBase = "bg-white border border-stone-200 rounded-2xl shadow-sm";
const card = cardBase + " p-5";
const EMOJI = { tomato: "🍅", onion: "🧅", chilli: "🌶️", rice: "🌾", maize: "🌽", banana: "🍌", mango: "🥭", groundnut: "🥜", turmeric: "🟡", cotton: "☁️" };
const emoji = (c) => EMOJI[c.toLowerCase()] || "🌱";
const API_URL = "http://localhost:5000/api";


const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisetu_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


const LINKS = {
  farmer: [
    ["Dashboard", "/farmer/dashboard", LayoutDashboard],
    ["My Produce", "/farmer/produce", Package],
    ["Requests", "/farmer/requests", Inbox],
    ["Connections", "/farmer/connections", Handshake]
  ],

  buyer: [
    ["Dashboard", "/buyer/dashboard", LayoutDashboard],
    ["Search", "/buyer/search", Search],
    ["Requirements", "/buyer/requirements", ClipboardList],
    ["Connections", "/buyer/connections", Handshake]
  ]
};

const Badge = ({ s }) => {
  const c = ["accepted", "Available", "Open"].includes(s) ? "bg-green-100 text-green-800" : s === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800";
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${c}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{s}</span>;
};

function Page({ role, children }) {
  const { user, setUser } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  if (!user || user.role !== role) return <Navigate to="/login" />;
  return (
    <div className="min-h-screen bg-cream text-stone-800 md:flex">

<aside className="md:w-60 md:fixed md:inset-y-0 md:left-0 bg-green-950 text-green-50 p-3 md:p-5 flex md:flex-col items-center md:items-stretch gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto border-r border-green-800/50">
  <Link
    to="/"
    className="flex items-center gap-2 font-serif text-xl font-semibold md:mb-6 shrink-0"
  >
    <span className="bg-green-700 p-1.5 rounded-lg">
      <Sprout size={18} />
    </span>
    AgriSetu
  </Link>

  {LINKS[role].map(([t, to, Icon]) => (
    <Link
      key={to}
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm shrink-0 transition ${
        loc.pathname === to || loc.pathname.startsWith(to + "/")
          ? "bg-green-700 text-white shadow-sm"
          : "text-green-100 hover:bg-green-800/80 hover:text-white"
      }`}
    >
      <Icon size={16} />
      {t}
    </Link>
  ))}

  <div className="ml-auto md:ml-0 md:mt-auto flex items-center gap-2 border-t border-green-800 md:pt-4 shrink-0">
    <span className="w-8 h-8 rounded-full bg-amber-200 text-green-900 grid place-items-center font-semibold text-sm">
      {(user.name || "U")[0].toUpperCase()}
    </span>

    <span className="hidden md:block text-sm flex-1 truncate">
      {user.name}
    </span>

    <button
      title="Logout"
      aria-label="Logout"
      className="p-2 rounded-lg hover:bg-green-800"
      onClick={() => {
        localStorage.removeItem("agrisetu_token");
        localStorage.removeItem("agrisetu_user");
        setUser(null);
        nav("/");
      }}
    >
      <LogOut size={16} />
    </button>
  </div>
</aside>
      <main className="md:ml-60 flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 bg-[#fafaf7] min-h-screen">{children}</main>
    </div>
  );
}

const Table = ({ heads, rows }) => (
  <div className={`${cardBase} overflow-x-auto`}>
    <table className="w-full text-sm">
      <thead className="bg-green-50 text-left text-xs uppercase tracking-wide text-green-900"><tr>{heads.map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
      <tbody>
        {rows.length === 0 && <tr><td className="p-8 text-center text-stone-500" colSpan={heads.length}>🌱 Nothing here yet.</td></tr>}
        {rows.map((r, i) => <tr key={i} className="border-t border-stone-100 hover:bg-stone-50">{r.map((c, j) => <td key={j} className="p-3">{c}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
);
const Stat = ({ n, label }) => {
  const Icon = /Listing/.test(label) ? Package : /Requirement/.test(label) ? ClipboardList : /Request/.test(label) ? Inbox : Handshake;
  return (
    <div className={`${card} flex items-center gap-4 hover:shadow-md hover:border-green-200 transition-all duration-200`}>
      <div className="bg-green-50 text-green-800 rounded-2xl p-3 ring-1 ring-green-100"><Icon size={22} /></div>
      <div><div className="font-serif text-3xl font-semibold text-green-900">{n}</div><div className="text-xs text-stone-500">{label}</div></div>
    </div>
  );
};

// ---------- Public ----------
const Check = ({ children }) => <li className="flex gap-2 text-sm"><CheckCircle2 size={18} className="text-green-700 shrink-0" />{children}</li>;
const Logo = () => <span className="flex items-center gap-2 font-serif text-xl font-semibold text-green-900"><span className="bg-green-800 text-white p-1.5 rounded-lg"><Sprout size={18} /></span>AgriSetu</span>;

function Landing() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">

      {/* Navbar */}
      <nav className="border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center shadow-sm">
              <Sprout className="text-white" size={22} />
            </div>
            <div>
              <div className="text-xl font-bold text-green-900">AgriSetu</div>
              <div className="text-[10px] tracking-wider text-stone-500 uppercase">
                Farmers • Buyers • Connections
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50 rounded-xl transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className={btn}
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-stone-50 to-amber-50" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-14 items-center">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
              <Sprout size={16} />
              Connecting Agriculture Directly
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-green-950 leading-tight">
              From the
              <span className="text-green-700"> Farm </span>
              to the
              <span className="text-amber-700"> Right Buyer.</span>
            </h1>

            <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-xl">
              AgriSetu helps farmers showcase their produce and connect
              directly with genuine buyers — making agricultural trade
              simpler, clearer and more accessible.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/register"
                className={`${btn} px-6 py-3`}
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className={`${btn2} px-6 py-3`}
              >
                Explore AgriSetu
              </Link>
            </div>

            <div className="flex gap-8 mt-10 pt-8 border-t border-stone-200">
              <div>
                <div className="text-2xl font-bold text-green-900">Direct</div>
                <div className="text-sm text-stone-500">Connections</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-green-900">Local</div>
                <div className="text-sm text-stone-500">Opportunities</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-green-900">Simple</div>
                <div className="text-sm text-stone-500">Marketplace</div>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-200/50 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl" />

            <div className="relative bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xl">

              <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-950 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-200 text-sm">AgriSetu Marketplace</p>
                    <h2 className="text-2xl font-semibold mt-1">
                      Fresh produce.
                    </h2>
                    <h2 className="text-2xl font-semibold">
                      Genuine buyers.
                    </h2>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Sprout size={26} />
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl">🍅</div>
                    <p className="mt-2 font-medium">Tomato</p>
                    <p className="text-xs text-green-200">Grade A</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl">🌶️</div>
                    <p className="mt-2 font-medium">Chilli</p>
                    <p className="text-xs text-green-200">Available</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <Package className="mx-auto text-green-700" size={20} />
                  <p className="text-xs mt-2 text-stone-600">Produce</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <Search className="mx-auto text-green-700" size={20} />
                  <p className="text-xs mt-2 text-stone-600">Discover</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <Handshake className="mx-auto text-green-700" size={20} />
                  <p className="text-xs mt-2 text-stone-600">Connect</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="text-center max-w-2xl mx-auto">
            <p className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              How AgriSetu works
            </p>

            <h2 className="text-3xl font-bold text-green-950 mt-2">
              A simpler way to connect
            </h2>

            <p className="text-stone-500 mt-3">
              Bring farmers and buyers together through a straightforward
              digital marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">

            {[
              {
                icon: Package,
                title: "List Produce",
                text: "Farmers can add their available crops with quantity, quality and location."
              },
              {
                icon: Search,
                title: "Discover",
                text: "Buyers can search and filter available produce based on their requirements."
              },
              {
                icon: Handshake,
                title: "Connect",
                text: "Interested buyers can send connection requests and start direct communication."
              }
            ].map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="bg-stone-50 border border-stone-200 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-lg transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Icon className="text-green-700" size={23} />
                  </div>

                  <div className="text-xs text-stone-400 mt-6">
                    0{i + 1}
                  </div>

                  <h3 className="text-lg font-bold text-green-950 mt-1">
                    {item.title}
                  </h3>

                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-950">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center text-white">
          <Sprout className="mx-auto mb-4 text-green-300" size={32} />

          <h2 className="text-3xl font-bold">
            Ready to connect through AgriSetu?
          </h2>

          <p className="text-green-200 mt-3">
            Create your account and start discovering agricultural opportunities.
          </p>

          <Link
            to="/register"
            className="inline-flex mt-7 bg-white text-green-900 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="bg-stone-950 text-stone-400 text-sm text-center py-5">
        © 2026 AgriSetu · Connecting Farmers & Buyers
      </footer>

    </div>
  );
}

function Login() {
  const { setUser } = useApp();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const go = (u) => {
    if (!u) return;

    setUser(u);
    nav(`/${u.role}/dashboard`);
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setErr("");

  const enteredEmail = email.trim().toLowerCase();

  if (!enteredEmail || !password) {
    setErr("Please enter your email and password.");
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: enteredEmail,
      password,
    });

    const loggedInUser = {
      ...response.data.user,
      _id: response.data.user.id,
    };

    localStorage.setItem("agrisetu_token", response.data.token);
localStorage.setItem("agrisetu_user", JSON.stringify(loggedInUser));    setUser(loggedInUser);
    nav(`/${loggedInUser.role}/dashboard`);
  } catch (error) {
    setErr(
      error.response?.data?.message ||
        "Unable to connect to the server. Please try again."
    );
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-stone-900 flex items-center justify-center p-5">

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE */}
        <div className="hidden md:flex bg-green-950 text-white p-10 flex-col justify-between">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Sprout size={23} />
            </div>

            <span className="text-xl font-bold">
              AgriSetu
            </span>
          </Link>

          <div>
            <p className="text-green-300 text-sm font-medium uppercase tracking-wider">
              Welcome back
            </p>

            <h1 className="text-4xl font-bold leading-tight mt-3">
              Connect.
              <br />
              Trade.
              <br />
              Grow.
            </h1>

            <p className="text-green-200 mt-5 leading-relaxed">
              Continue connecting with farmers and buyers
              through AgriSetu.
            </p>
          </div>

          <p className="text-green-300 text-xs">
            Farmers • Buyers • Opportunities
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-7 sm:p-10">

          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-7">
            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center">
              <Sprout className="text-white" />
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-green-950">
              Login to AgriSetu
            </h2>

            <p className="text-sm text-stone-500 mt-1">
              Access your agricultural marketplace account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-stone-700">
                Email
              </label>

              <input
                className={`${inp} mt-1`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-stone-700">
                Password
              </label>

              <input
                className={`${inp} mt-1`}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ERROR */}
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {err}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className={`${btn} w-full py-3`}
            >
              Login
            </button>

          </form>

          {/* REGISTER */}
          <p className="text-sm text-center text-stone-500 mt-7">
            Don't have an account?{" "}
            <Link
              className="text-green-700 font-semibold hover:underline"
              to="/register"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

function Register() {
  const { setUser } = useApp();
  const nav = useNavigate();

  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "farmer",
    district: "",
    state: "",
  });

  const [err, setErr] = useState("");

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
  e.preventDefault();
  setErr("");

  if (!f.name.trim() || !f.email.includes("@")) {
    return setErr("Enter a name and valid email.");
  }

  if (!/^\d{10}$/.test(f.phone)) {
    return setErr("Phone must be 10 digits.");
  }

  if (f.password.length < 8 || f.password !== f.confirm) {
    return setErr("Password must be 8+ characters and match.");
  }

  if (!f.district || !f.state) {
    return setErr("District and state are required.");
  }

  try {
    await axios.post(`${API_URL}/auth/register`, {
      name: f.name.trim(),
      email: f.email.trim().toLowerCase(),
      password: f.password,
      role: f.role,
      phone: f.phone,
      district: f.district,
      state: f.state,
    });

    const response = await axios.post(`${API_URL}/auth/login`, {
      email: f.email.trim().toLowerCase(),
      password: f.password,
    });

    const loggedInUser = {
      ...response.data.user,
      _id: response.data.user.id,
    };

    localStorage.setItem("agrisetu_token", response.data.token);
    localStorage.setItem("agrisetu_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    nav(`/${loggedInUser.role}/dashboard`);
  } catch (error) {
    setErr(
      error.response?.data?.message ||
        "Unable to connect to the server. Please try again."
    );
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-stone-900 flex items-center justify-center p-5">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE */}
        <div className="hidden md:flex bg-green-950 text-white p-10 flex-col justify-between">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Sprout size={23} />
            </div>

            <span className="text-xl font-bold">
              AgriSetu
            </span>
          </Link>

          <div>
            <p className="text-green-300 text-sm font-medium uppercase tracking-wider">
              Join AgriSetu
            </p>

            <h1 className="text-4xl font-bold leading-tight mt-3">
              Grow your
              <br />
              connections.
            </h1>

            <p className="text-green-200 mt-5 leading-relaxed">
              Whether you are a farmer looking for genuine buyers
              or a buyer searching for fresh produce, AgriSetu
              helps you connect directly.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Package size={18} />
                </div>

                <span className="text-sm text-green-100">
                  Showcase your produce
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Search size={18} />
                </div>

                <span className="text-sm text-green-100">
                  Discover opportunities
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Handshake size={18} />
                </div>

                <span className="text-sm text-green-100">
                  Build direct connections
                </span>
              </div>

            </div>
          </div>

          <p className="text-green-300 text-xs">
            Farmers • Buyers • Opportunities
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-7 sm:p-10">

          {/* MOBILE LOGO */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center">
              <Sprout className="text-white" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-green-950">
              Create your account
            </h2>

            <p className="text-sm text-stone-500 mt-1">
              Join AgriSetu and start connecting.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">

            {/* PERSONAL INFORMATION */}
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                Personal Information
              </p>

              <div className="space-y-3">

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Full Name
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    placeholder="Enter your full name"
                    value={f.name}
                    onChange={set("name")}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">

                  <div>
                    <label className="text-sm font-medium text-stone-700">
                      Email
                    </label>

                    <input
                      className={`${inp} mt-1`}
                      type="email"
                      placeholder="you@example.com"
                      value={f.email}
                      onChange={set("email")}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700">
                      Phone
                    </label>

                    <input
                      className={`${inp} mt-1`}
                      type="tel"
                      maxLength="10"
                      placeholder="10-digit number"
                      value={f.phone}
                      onChange={set("phone")}
                    />
                  </div>

                </div>

              </div>
            </div>

            {/* ACCOUNT TYPE */}
            <div className="border-t border-stone-200 pt-5">

              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                Account Type
              </p>

              <div className="grid grid-cols-2 gap-3">

                {["farmer", "buyer"].map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setF({ ...f, role })}
                    className={`p-4 rounded-xl border text-left transition ${
                      f.role === role
                        ? "border-green-600 bg-green-50 ring-2 ring-green-600/20"
                        : "border-stone-200 hover:border-green-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {role === "farmer" ? "🌱" : "🏪"}
                    </div>

                    <div className="font-semibold text-green-950">
                      {role === "farmer" ? "Farmer" : "Buyer"}
                    </div>

                    <div className="text-xs text-stone-500 mt-1">
                      {role === "farmer"
                        ? "List your produce"
                        : "Find agricultural produce"}
                    </div>
                  </button>
                ))}

              </div>
            </div>

            {/* LOCATION */}
            <div className="border-t border-stone-200 pt-5">

              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                Location
              </p>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    District
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    placeholder="e.g. Guntur"
                    value={f.district}
                    onChange={set("district")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    State
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    placeholder="e.g. Andhra Pradesh"
                    value={f.state}
                    onChange={set("state")}
                  />
                </div>

              </div>
            </div>

            {/* SECURITY */}
            <div className="border-t border-stone-200 pt-5">

              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                Security
              </p>

              <div className="grid sm:grid-cols-2 gap-3">

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Password
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={f.password}
                    onChange={set("password")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Confirm Password
                  </label>

                  <input
                    className={`${inp} mt-1`}
                    type="password"
                    placeholder="Re-enter password"
                    value={f.confirm}
                    onChange={set("confirm")}
                  />
                </div>

              </div>
            </div>

            {/* ERROR */}
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {err}
              </div>
            )}

            {/* CREATE ACCOUNT */}
            <button
              type="submit"
              className={`${btn} w-full py-3`}
            >
              Create Account
            </button>

          </form>

          {/* LOGIN LINK */}
          <p className="text-sm text-center text-stone-500 mt-6">
            Already have an account?{" "}
            <Link
              className="text-green-700 font-semibold hover:underline"
              to="/login"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

// ---------- Farmer ----------
function FarmerDash() {
  const { user, produce, conns } = useApp();
  const mine = produce.filter((p) => p.farmerId === user._id);
  const reqs = conns.filter((c) => mine.some((p) => p._id === c.produceId));
  return (
    <Page role="farmer">
      <div><h1 className="font-serif text-3xl font-semibold text-green-900">Welcome, {user.name.split(" ")[0]} 👋</h1><p className="text-stone-500 text-sm mt-1">Here is what is happening with your produce today.</p></div>
      <div className="grid grid-cols-3 gap-3">
        <Stat n={mine.filter((p) => p.status === "Available").length} label="Active Listings" />
        <Stat n={reqs.length} label="Buyer Requests" />
        <Stat n={reqs.filter((c) => c.status === "accepted").length} label="Connections" />
      </div>
      <h2 className="font-semibold text-lg text-green-900">Recent Produce</h2>
      <Table heads={["Crop", "Quantity", "Quality", "Status"]} rows={mine.slice(0, 5).map((p) => [p.crop, `${p.quantity} ${p.unit}`, p.quality, <Badge s={p.status} />])} />
    </Page>
  );
}

function FarmerProduce() {
  const { user, produce, setProduce } = useApp();
  const [q, setQ] = useState("");
  const rows = produce.filter((p) => p.farmerId === user._id && p.crop.toLowerCase().includes(q.toLowerCase()));
  
const deleteProduce = async (p) => {
  if (!window.confirm(`Delete ${p.crop}?`)) return;

  try {
    await api.delete(`/produce/${p._id}`);

    setProduce((previous) =>
      previous.filter((item) => item._id !== p._id)
    );
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Unable to delete produce. Please try again."
    );
  }
};


  return (
    <Page role="farmer">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold text-green-900">My Produce</h1>
        <Link to="/farmer/produce/add" className={`${btn} ml-auto`}>+ Add Produce</Link>
      </div>
      <input className={inp} placeholder="Search by crop..." value={q} onChange={(e) => setQ(e.target.value)} />
      <Table heads={["Crop", "Quantity", "Quality", "Location", "Available", "Status", "Actions"]}
        rows={rows.map((p) => [p.crop, `${p.quantity} ${p.unit}`, p.quality, p.district, p.date, <Badge s={p.status} />,
          <span className="flex gap-3 text-green-800">
            <Link to={`/farmer/produce/${p._id}/edit`}>Edit</Link>
<button
  className="text-red-600"
  onClick={() => deleteProduce(p)}
>
  Delete
</button>
          </span>])} />
    </Page>
  );
}


function ProduceForm() {
  const { id } = useParams();
  const { user, produce, setProduce, produceLoading } = useApp();
  const nav = useNavigate();

  const old = produce.find((p) => p._id === id);

  const [f, setF] = useState(() => old || {
    crop: "",
    quantity: "",
    unit: "kg",
    quality: "Grade A",
    date: "",
    district: user?.district || "",
    state: user?.state || "",
    description: ""
  });

  const [err, setErr] = useState("");

  useEffect(() => {
    if (id && old) {
      setF({
        crop: old.crop || "",
        quantity: old.quantity ?? "",
        unit: old.unit || "kg",
        quality: old.quality || "Grade A",
        date: old.date || "",
        district: old.district || "",
        state: old.state || "",
        description: old.description || ""
      });
    }
  }, [id, old?._id]);

  const set = (k) => (e) =>
    setF((previous) => ({
      ...previous,
      [k]: e.target.value
    }));
const submit = async () => {
  if (
    !f.crop.trim() ||
    !(Number(f.quantity) > 0) ||
    !f.date ||
    !f.district.trim() ||
    !f.state.trim()
  ) {
    return setErr("Crop, quantity, date, district and state are required.");
  }

  setErr("");

  const data = {
    crop: f.crop.trim(),
    quantity: Number(f.quantity),
    unit: f.unit,
    quality: f.quality,
    date: f.date,
    district: f.district.trim(),
    state: f.state.trim(),
    description: f.description || "",
  };

  try {
    if (old) {
      const response = await api.patch(`/produce/${old._id}`, data);
      const updatedProduce = response.data.produce;

      setProduce((previous) =>
        previous.map((p) =>
          p._id === old._id ? updatedProduce : p
        )
      );
    } else {
      const response = await api.post("/produce", data);
      const newProduce = response.data.produce;

      setProduce((previous) => [newProduce, ...previous]);
    }

    nav("/farmer/produce");
  } catch (error) {
    setErr(
      error.response?.data?.message ||
      "Unable to save produce. Please try again."
    );
  }
};


if (id && produceLoading) {
  return (
    <Page role="farmer">
      <p>Loading produce...</p>
    </Page>
  );
}

if (id && !old && !produceLoading) {
  return (
    <Page role="farmer">
      <p>Produce not found.</p>
      <Link to="/farmer/produce" className={btn2}>
        Back to My Produce
      </Link>
    </Page>
  );
}
  return (
    <Page role="farmer">
      <div className={`${card} max-w-xl space-y-3`}>
        <h1 className="text-xl font-bold text-green-900">{old ? "Edit Produce" : "Add Produce"}</h1>
        <input className={inp} placeholder="Crop name" value={f.crop} onChange={set("crop")} />
        <div className="grid grid-cols-2 gap-2">
          <input className={inp} type="number" placeholder="Quantity" value={f.quantity} onChange={set("quantity")} />
          <select className={inp} value={f.unit} onChange={set("unit")}><option>kg</option><option>quintal</option><option>ton</option></select>
          <select className={inp} value={f.quality} onChange={set("quality")}><option>Grade A</option><option>Grade B</option><option>Grade C</option></select>
          <input className={inp} type="date" value={f.date} onChange={set("date")} />
          <input className={inp} placeholder="District" value={f.district} onChange={set("district")} />
          <input className={inp} placeholder="State" value={f.state} onChange={set("state")} />
        </div>
        <textarea className={inp} placeholder="Description" value={f.description} onChange={set("description")} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex gap-2"><button className={btn} onClick={submit}>{old ? "Update" : "Add Produce"}</button><button className={btn2} onClick={() => nav("/farmer/produce")}>Cancel</button></div>
      </div>
    </Page>
  );
}


function FarmerRequests({ onlyAccepted }) {
  const { user, users, produce, conns, setConns } = useApp();

  const rows = conns
    .map((c) => ({
      c,
      p: produce.find((p) => p._id === c.produceId),
      b: users.find((u) => u._id === c.buyerId),
    }))
    .filter(
      (x) =>
        x.p?.farmerId === user?._id &&
        (!onlyAccepted || x.c.status === "accepted")
    );

  
const upd = async (id, status) => {
  try {
    await api.patch(`/connections/${id}/status`, { status });

    setConns((previous) =>
      previous.map((c) =>
        c._id === id ? { ...c, status } : c
      )
    );
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Unable to update request."
    );
  }
};



  return (
    <Page role="farmer">
      <h1 className="font-serif text-3xl font-semibold text-green-900">
        {onlyAccepted ? "Connections" : "Buyer Requests"}
      </h1>

      <Table
        heads={[
          "Buyer",
          "Crop",
          "Status",
          onlyAccepted ? "Contact" : "Actions",
        ]}
        rows={rows.map(({ c, p, b }) => [
          b?.name || "Buyer information unavailable",
          p?.crop || "Produce unavailable",
          <Badge s={c.status} />,
          onlyAccepted ? (
            c.status === "accepted" && b
              ? `${b.phone || "No phone"} · ${b.email || "No email"}`
              : "Buyer contact unavailable"
          ) : c.status === "pending" ? (
            <span className="flex gap-2">
              <button
                className={btn}
                onClick={() => upd(c._id, "accepted")}
              >
                Accept
              </button>
              <button
                className={btn2}
                onClick={() => upd(c._id, "rejected")}
              >
                Reject
              </button>
            </span>
          ) : (
            "-"
          ),
        ])}
      />
    </Page>
  );
}


// ---------- Buyer ----------
function BuyerDash() {
  const { user, reqs, conns, produce } = useApp();
  const mine = conns.filter((c) => c.buyerId === user._id);
  const myReqs = reqs.filter((r) => r.buyerId === user._id);
  const rec = produce.filter((p) => myReqs.some((r) => r.crop.toLowerCase() === p.crop.toLowerCase()));
  return (
    <Page role="buyer">
      <div><h1 className="font-serif text-3xl font-semibold text-green-900">Welcome, {user.name} 👋</h1><p className="text-stone-500 text-sm mt-1">Find fresh produce and connect with farmers directly.</p></div>
      <div className="grid grid-cols-3 gap-3">
        <Stat n={myReqs.filter((r) => r.status === "Open").length} label="Open Requirements" />
        <Stat n={mine.length} label="Requests Sent" />
        <Stat n={mine.filter((c) => c.status === "accepted").length} label="Connections" />
      </div>
      <h2 className="font-semibold text-lg text-green-900">Recommended Produce</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {rec.map((p) => <ProduceCard key={p._id} p={p} />)}
        {rec.length === 0 && <p className="text-stone-500 text-sm">Post a requirement to get recommendations.</p>}
      </div>
    </Page>
  );
}

function ProduceCard({ p }) {
  const { users } = useApp();
  
  return (
    <div className={`${cardBase} overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-green-200 transition-all duration-200`}>
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50 h-28 grid place-items-center text-5xl border-b border-green-100">{emoji(p.crop)}</div>
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-green-900 text-lg">{p.crop}</h3><span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{p.quality}</span></div>
        <p className="text-sm font-medium">{p.quantity} {p.unit}</p>
        <p className="text-sm text-stone-500 flex items-center gap-1"><MapPin size={14} />{p.district}, {p.state}</p>
        <p className="text-sm text-stone-500 flex items-center gap-1"><CalendarDays size={14} />Available from {p.date}</p>
        <p className="text-sm text-stone-500">Farmer: {users.find((u) => u._id === p.farmerId)?.name}</p>
        <Link to={`/buyer/produce/${p._id}`} className={`${btn} w-full mt-3`}>View Details</Link>
      </div>
    </div>
  );
}

function BuyerSearch() {
  const { produce } = useApp();
  const [f, setF] = useState({ q: "", district: "", quality: "" });
  const rows = produce.filter((p) => p.status === "Available" && p.crop.toLowerCase().includes(f.q.toLowerCase())
    && p.district.toLowerCase().includes(f.district.toLowerCase()) && (!f.quality || p.quality === f.quality));
  return (
    <Page role="buyer">
      <h1 className="font-serif text-3xl font-semibold text-green-900">Search Produce</h1>
      <div className={`${card} grid md:grid-cols-3 gap-3`}>
        <input className={inp} placeholder="Crop name" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <input className={inp} placeholder="District" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} />
        <select className={inp} value={f.quality} onChange={(e) => setF({ ...f, quality: e.target.value })}><option value="">Any quality</option><option>Grade A</option><option>Grade B</option><option>Grade C</option></select>
      </div>
      <p className="text-sm text-stone-500">{rows.length} result(s)</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{rows.map((p) => <ProduceCard key={p._id} p={p} />)}</div>
    </Page>
  );
}


function ProduceDetails() {
  const { id } = useParams();
  const { user, users, produce, conns, setConns } = useApp();

  const p = produce.find((x) => x._id === id);

  if (!p) {
    return (
      <Page role="buyer">
        <p>Produce not found.</p>
      </Page>
    );
  }

  const farmer = users.find((u) => u._id === p.farmerId);

  const conn = conns.find(
    (c) => c.buyerId === user?._id && c.produceId === p._id
  );

  const others = produce
    .filter((x) => x.farmerId === p.farmerId)
    .map((x) => x.crop)
    .join(", ");
  
const sendRequest = async () => {
  try {
    const response = await api.post("/connections", {
      farmerId: p.farmerId,
      produceId: p._id,
    });

    const c = response.data.connection;

    setConns((previous) => {
      const next = [
        ...previous.filter(
          (item) =>
            !(
              item.buyerId === user._id &&
              item.produceId === p._id
            )
        ),
        {
          _id: c._id,
          buyerId: user._id,
          farmerId: p.farmerId,
          produceId: p._id,
          status: c.status,
        },
      ];

      return next;
    });
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Unable to send connection request."
    );
  }
};

  return (
    <Page role="buyer">
      <div className={`${card} max-w-xl space-y-1`}>
        <h1 className="font-serif text-3xl font-semibold text-green-900">
          {emoji(p.crop)} {p.crop}
        </h1>

        <p>
          {p.quantity} {p.unit} · {p.quality} · Available {p.date}
        </p>

        <p className="text-stone-600">
          {p.district}, {p.state}
        </p>

        <p>{p.description}</p>

        <hr className="my-2" />

        {farmer ? (
          <>
            <p>
              Farmer: <b>{farmer.name}</b> ({farmer.district})
            </p>
            <p className="text-sm text-stone-500">
              Listed crops: {others || "No other listings"}
            </p>
          </>
        ) : (
          <>
            <p>Farmer: Information unavailable</p>
            <p className="text-sm text-stone-500">
              The farmer's profile could not be loaded.
            </p>
          </>
        )}

        {!conn && (
          
<button
  className={`${btn} mt-3`}
  onClick={sendRequest}
>
  Send Connection Request
</button>


        )}

        {conn && (
          <button className={`${btn} mt-3 opacity-60`} disabled>
            {conn.status === "pending"
              ? "Request Sent"
              : `Request ${conn.status}`}
          </button>
        )}

        {conn?.status === "accepted" && farmer ? (
          <p className="mt-2 text-green-800">
            Phone: {farmer.phone} · Email: {farmer.email}
          </p>
        ) : (
          <p className="mt-2 text-sm text-stone-500">
            Contact details will be available after the farmer accepts your
            request.
          </p>
        )}
      </div>
    </Page>
  );
}



function BuyerReqs() {
  const { user, reqs, setReqs } = useApp();
  const [f, setF] = useState({ crop: "", quantity: "", date: "" });
  const add = () => {
    if (!f.crop || !(Number(f.quantity) > 0) || !f.date) return;
    setReqs([...reqs, { _id: uid(), buyerId: user._id, crop: f.crop, quantity: Number(f.quantity), date: f.date, status: "Open" }]);
    setF({ crop: "", quantity: "", date: "" });
  };
  return (
    <Page role="buyer">
      <h1 className="font-serif text-3xl font-semibold text-green-900">My Requirements</h1>
      <div className={`${card} grid md:grid-cols-4 gap-2`}>
        <input className={inp} placeholder="Crop" value={f.crop} onChange={(e) => setF({ ...f, crop: e.target.value })} />
        <input className={inp} type="number" placeholder="Quantity (kg)" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} />
        <input className={inp} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <button className={btn} onClick={add}>+ Post Requirement</button>
      </div>
      <Table heads={["Crop", "Quantity", "Required by", "Status", ""]}
        rows={reqs.filter((r) => r.buyerId === user._id).map((r) => [r.crop, `${r.quantity} kg`, r.date, <Badge s={r.status} />,
          <button className="text-red-600" onClick={() => setReqs(reqs.filter((x) => x._id !== r._id))}>Delete</button>])} />
    </Page>
  );
}


function BuyerConns() {
  const { user, users, produce, conns } = useApp();

  const rows = conns
    .filter((c) => c.buyerId === user?._id)
    .map((c) => {
      const p = produce.find((x) => x._id === c.produceId);
      const fm = users.find((u) => u._id === p?.farmerId);

      return [
        p?.crop || "Produce unavailable",
        fm?.name || "Farmer information unavailable",
        <Badge s={c.status} />,
        c.status === "accepted"
          ? `${fm?.phone || "No phone"} · ${fm?.email || "No email"}`
          : "Hidden until accepted",
      ];
    });

  return (
    <Page role="buyer">
      <h1 className="font-serif text-3xl font-semibold text-green-900">
        My Connections
      </h1>

      <Table
        heads={["Crop", "Farmer", "Status", "Contact"]}
        rows={rows}
      />
    </Page>
  );
}



// ---------- Admin ----------


// ---------- App ----------
export default function App() {
  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("agrisetu_user")) || null;
  } catch {
    return null;
  }
});

const [users, setUsers] = useState([]);
const [produce, setProduce] = useState([]);
const [produceLoading, setProduceLoading] = useState(true);

useEffect(() => {
  let cancelled = false;

  api
    .get("/produce")
    .then((response) => {
      if (!cancelled) {
        setProduce(response.data.produce || []);
      }
    })
    .catch((error) => {
      console.error(
        "Unable to load produce:",
        error.response?.data || error.message
      );
    })
    .finally(() => {
      if (!cancelled) setProduceLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);

const [reqs, setReqs] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("agrisetu_reqs")) || [];
  } catch {
    return [];
  }
});

const [conns, setConns] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("agrisetu_conns")) || [];
  } catch {
    return [];
  }
});

useEffect(() => {
  if (!user || !localStorage.getItem("agrisetu_token")) return;

  let cancelled = false;

  api
    .get("/connections/mine")
    .then((response) => {
      if (cancelled) return;

      const connections = response.data.connections || [];

      setConns(
        connections.map((c) => ({
          _id: c.id,
          buyerId: c.buyerId,
          farmerId: c.farmerId,
          produceId: c.produceId,
          status: c.status,
        }))
      );

      setUsers((previous) => {
        const profiles = connections
          .filter((c) => c.otherUser)
          .map((c) => ({
            ...c.otherUser,
            _id:
              user.role === "buyer"
                ? c.farmerId
                : c.buyerId,
          }));

        const merged = [...previous, ...profiles, user];
        return [
          ...new Map(merged.map((u) => [u._id, u])).values(),
        ];
      });
    })
    .catch((error) => {
      console.error(
        "Unable to load connections:",
        error.response?.data || error.message
      );
    });

  return () => {
    cancelled = true;
  };
}, [user]);





useEffect(() => {
  localStorage.setItem("agrisetu_reqs", JSON.stringify(reqs));
}, [reqs]);

useEffect(() => {
  localStorage.setItem("agrisetu_conns", JSON.stringify(conns));
}, [conns]);
  return (
    <Ctx.Provider value={{ user, setUser, users, setUsers, produce, setProduce, produceLoading, reqs, setReqs, conns, setConns }}>
      <BrowserRouter>

          <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  <Route path="/farmer/dashboard" element={<FarmerDash />} />
  <Route path="/farmer/produce" element={<FarmerProduce />} />
  <Route path="/farmer/produce/add" element={<ProduceForm />} />
  <Route path="/farmer/produce/:id/edit" element={<ProduceForm />} />
  <Route path="/farmer/requests" element={<FarmerRequests />} />
  <Route path="/farmer/connections" element={<FarmerRequests onlyAccepted />} />

  <Route path="/buyer/dashboard" element={<BuyerDash />} />
  <Route path="/buyer/search" element={<BuyerSearch />} />
  <Route path="/buyer/produce/:id" element={<ProduceDetails />} />
  <Route path="/buyer/requirements" element={<BuyerReqs />} />
  <Route path="/buyer/connections" element={<BuyerConns />} />

  <Route
    path="*"
    element={
      <div className="p-10 text-center">
        Page not found.{" "}
        <Link className="underline" to="/">
          Home
        </Link>
      </div>
    }
  />
</Routes>        
      </BrowserRouter>
    </Ctx.Provider>
  );
}
