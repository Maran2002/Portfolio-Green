import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const projectSchema = new mongoose.Schema({
  type: String, title: String, description: String, complexity: String, url: String,
  link: String, tech: [String], color: String, accent: String, base64Image: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
const visitorSchema = new mongoose.Schema({
  ip: String, userAgent: String, browser: String, os: String, device: String,
  referrer: String, page: String, sessionId: String, language: String,
  screenWidth: Number, screenHeight: Number,
}, { timestamps: true });
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true }, value: String,
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
const Visitor = mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);
const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (!globalThis.__portfolioMongoPromise) {
    globalThis.__portfolioMongoPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      globalThis.__portfolioMongoPromise = null;
      throw error;
    });
  }
  await globalThis.__portfolioMongoPromise;
}

const json = (payload, status = 200) => Response.json(payload, { status });
const serverError = () => json({ success: false, message: "Server Error" }, 500);

const rateBuckets = globalThis.__portfolioRateBuckets || new Map();
globalThis.__portfolioRateBuckets = rateBuckets;
function rateLimit(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = rateBuckets.get(ip);
  if (!current || current.expiresAt <= now) {
    rateBuckets.set(ip, { count: 1, expiresAt: now + 15 * 60 * 1000 });
    return null;
  }
  current.count += 1;
  return current.count > 100
    ? json({ success: false, message: "Too many requests from this IP, please try again later." }, 429)
    : null;
}

function apiSecurityError(request) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || "";
  const headerName = (process.env.NEXT_PUBLIC_APP_HEADER_NAME || process.env.APP_HEADER_NAME || "x-client-access-id-pf").toLowerCase();
  const headerValue = process.env.NEXT_PUBLIC_APP_HEADER_VALUE || process.env.APP_HEADER_VALUE || "";
  if (!apiKey || request.headers.get("x-api-key") !== apiKey) return json({ success: false, message: "Forbidden: Invalid API Key" }, 403);
  if (!headerValue || request.headers.get(headerName) !== headerValue) return json({ success: false, message: "Forbidden: Invalid App Context" }, 403);
  return null;
}

function getUser(request) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) return { error: json({ success: false, message: "Unauthorized" }, 401) };
  try {
    return { user: jwt.verify(token, process.env.JWT_SECRET) };
  } catch {
    return { error: json({ success: false, message: "Invalid Token" }, 403) };
  }
}

async function settingsObject() {
  const settings = await Settings.find();
  return Object.fromEntries(settings.map(({ key, value }) => [key, value]));
}

function parseUserAgent(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) && !/Chromium/.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) && !/Chrome/.test(ua) ? "Safari" : /MSIE|Trident\//.test(ua) ? "IE" : "Other";
  const os = /Windows/.test(ua) ? "Windows" : /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  const device = /iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua) ? "Mobile" : /iPad|Android(?!.*Mobile)/i.test(ua) ? "Tablet" : "Desktop";
  return { browser, os, device };
}

const istOffset = 5.5 * 60 * 60 * 1000;
const istMidnight = (d) => {
  const ist = new Date(d.getTime() + istOffset);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - istOffset);
};

function dateFilter({ range, date }, now = new Date()) {
  let startDate, endDate, groupFormat = "%Y-%m";
  if (date) {
    const [y, m, day] = date.split("-").map(Number);
    startDate = new Date(Date.UTC(y, m - 1, day) - istOffset);
    endDate = new Date(startDate.getTime() + 86400000);
    groupFormat = "%H";
  } else if (range === "today") {
    startDate = istMidnight(now); groupFormat = "%H";
  } else if (range === "7d") {
    startDate = istMidnight(new Date(now.getTime() - 7 * 86400000)); groupFormat = "%Y-%m-%d";
  } else if (range === "30d") {
    startDate = istMidnight(new Date(now.getTime() - 30 * 86400000)); groupFormat = "%Y-%m-%d";
  } else if (range === "15m") {
    startDate = new Date(now.getTime() - 15 * 60000); groupFormat = "%H:%M";
  }
  return { startDate, endDate, groupFormat };
}

async function analyticsStats(url) {
  const params = Object.fromEntries(url.searchParams);
  const range = params.range || "30d";
  const granularity = params.granularity || "1h";
  const now = new Date();
  const { startDate, endDate, groupFormat } = dateFilter({ range, date: params.date }, now);
  const filter = endDate ? { createdAt: { $gte: startDate, $lt: endDate } } : startDate ? { createdAt: { $gte: startDate } } : {};
  const todayStart = istMidnight(now);
  const binSize = granularity === "15m" ? 15 : granularity === "10m" ? 10 : null;
  const byTimeGroupId = binSize
    ? { $dateToString: { format: "%Y-%m-%d %H:%M", date: { $dateTrunc: { date: "$createdAt", unit: "minute", binSize, timezone: "+05:30" } }, timezone: "+05:30" } }
    : { $dateToString: { format: groupFormat, date: "$createdAt", timezone: "+05:30" } };
  const [total, uniqueIps, byTime, byPage, byDevice, byBrowser, todayCount] = await Promise.all([
    Visitor.countDocuments(filter), Visitor.distinct("ip", filter),
    Visitor.aggregate([{ $match: filter }, { $group: { _id: byTimeGroupId, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Visitor.aggregate([{ $match: filter }, { $group: { _id: "$page", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
    Visitor.aggregate([{ $match: filter }, { $group: { _id: "$device", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Visitor.aggregate([{ $match: filter }, { $group: { _id: "$browser", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Visitor.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);
  return json({ success: true, stats: {
    total, uniqueIps: uniqueIps.length, todayCount, range,
    byTime: byTime.map((d) => ({ time: d._id, count: d.count })),
    byPage: byPage.map((p) => ({ page: p._id || "/", count: p.count })),
    byDevice: byDevice.map((d) => ({ device: d._id || "Unknown", count: d.count })),
    byBrowser: byBrowser.map((b) => ({ browser: b._id || "Unknown", count: b.count })),
  } });
}

async function analyticsVisitors(url) {
  const params = Object.fromEntries(url.searchParams);
  const now = new Date();
  let { startDate, endDate } = dateFilter({ range: params.range || "30d", date: params.date }, now);
  if (params.range === "7d" || params.range === "30d") startDate = new Date(now.getTime() - (params.range === "7d" ? 7 : 30) * 86400000);
  const filter = {};
  if (endDate) filter.createdAt = { $gte: startDate, $lt: endDate };
  else if (startDate) filter.createdAt = { $gte: startDate };
  if (params.device) filter.device = params.device;
  if (params.browser) filter.browser = params.browser;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10));
  const limit = Math.max(1, Math.min(100, Number.parseInt(params.limit || "15", 10)));
  const [visitors, total] = await Promise.all([
    Visitor.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-userAgent"),
    Visitor.countDocuments(filter),
  ]);
  return json({ success: true, visitors, total, pages: Math.ceil(total / limit) });
}

export async function handlePortfolioApi(request, path) {
  const limited = rateLimit(request);
  if (limited) return limited;
  const securityError = apiSecurityError(request);
  if (securityError) return securityError;
  const method = request.method.toUpperCase();
  const url = new URL(request.url);
  const parts = path.split("/").filter(Boolean);
  const body = method === "GET" || method === "HEAD" ? {} : await request.json().catch(() => ({}));
  const isAdmin = parts[0] === "admin";
  let user;
  if (isAdmin && !(parts[1] === "login" && method === "POST")) {
    const auth = getUser(request);
    if (auth.error) return auth.error;
    user = auth.user;
  }
  void user;
  try {
    await connectDatabase();
    if (parts.join("/") === "admin/login" && method === "POST") {
      if (body.username === process.env.ADMIN_USERNAME && body.password === process.env.ADMIN_PASSWORD) {
        return json({ success: true, token: jwt.sign({ username: body.username }, process.env.JWT_SECRET, { expiresIn: "12h" }) });
      }
      return json({ success: false, message: "Invalid credentials" }, 401);
    }
    if (parts.join("/") === "settings" && method === "GET") return json({ success: true, settings: await settingsObject() });
    if (parts.join("/") === "admin/settings" && method === "GET") return json({ success: true, settings: await settingsObject() });
    if (parts[0] === "admin" && parts[1] === "settings" && parts[2] && method === "PUT") {
      const updated = await Settings.findOneAndUpdate({ key: parts[2] }, { value: body.value }, { upsert: true, new: true });
      return json({ success: true, setting: updated });
    }
    if (parts.join("/") === "projects" && method === "GET") return json({ success: true, projects: await Project.find().sort({ createdAt: -1 }) });
    if (parts.join("/") === "admin/projects" && method === "GET") return json({ success: true, projects: await Project.find().sort({ createdAt: -1 }) });
    if (parts.join("/") === "admin/projects" && method === "POST") {
      const project = await new Project(body).save();
      return json({ success: true, project });
    }
    if (parts[0] === "admin" && parts[1] === "projects" && parts[2] && method === "PUT") {
      return json({ success: true, project: await Project.findByIdAndUpdate(parts[2], body, { new: true }) });
    }
    if (parts[0] === "admin" && parts[1] === "projects" && parts[2] && method === "DELETE") {
      await Project.findByIdAndDelete(parts[2]);
      return json({ success: true, message: "Project deleted" });
    }
    if (parts.join("/") === "track" && method === "POST") {
      const ua = request.headers.get("user-agent") || "";
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { browser, os, device } = parseUserAgent(ua);
      await Visitor.create({ ip, userAgent: ua, browser, os, device, referrer: body.referrer || "", page: body.page || "/", sessionId: body.sessionId || "", language: body.language || "", screenWidth: Number(body.screenWidth) || 0, screenHeight: Number(body.screenHeight) || 0 });
      return json({ success: true });
    }
    if (parts.join("/") === "admin/analytics/stats" && method === "GET") return await analyticsStats(url);
    if (parts.join("/") === "admin/analytics/visitors" && method === "GET") return await analyticsVisitors(url);
    return json({ success: false, message: "Not Found" }, 404);
  } catch (error) {
    console.error("Portfolio API error:", error);
    if (parts.join("/") === "track") return json({ success: false }, 500);
    if (parts[0] === "admin" && parts[1] === "settings" && method === "PUT") return json({ success: false, message: "Failed to update setting" }, 500);
    if (parts.join("/") === "admin/projects" && method === "POST") return json({ success: false, message: "Failed to create project" }, 500);
    if (parts[0] === "admin" && parts[1] === "projects" && parts[2] && method === "PUT") return json({ success: false, message: "Failed to update project" }, 500);
    if (parts[0] === "admin" && parts[1] === "projects" && parts[2] && method === "DELETE") return json({ success: false, message: "Failed to delete project" }, 500);
    return serverError();
  }
}

export async function handleSendEmail(request) {
  const limited = rateLimit(request);
  if (limited) return limited;
  const securityError = apiSecurityError(request);
  if (securityError) return securityError;
  const { name, email, message } = await request.json().catch(() => ({}));
  if (!name || !email || !message) return json({ success: false, message: "Name, email, and message are required." }, 400);
  try {
    const transporter = nodemailer.createTransport({ service: process.env.MAIL_SERVICE, auth: { user: process.env.MAIL_SENDER_EMAIL, pass: process.env.MAIL_SENDER_PASS } });
    await transporter.sendMail({ from: email, to: process.env.MAIL_RECIPIENT_EMAIL, subject: `From ${name} via Portfolio`, text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}` });
    return json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return json({ success: false, message: "Failed to send email." }, 500);
  }
}
