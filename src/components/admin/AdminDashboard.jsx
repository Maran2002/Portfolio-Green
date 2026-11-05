import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../utils/apiConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Edit, Trash2, Link, Save, BarChart2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import Select from "react-select";

const tailwindColors = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", 
  "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", 
  "purple", "fuchsia", "pink", "rose"
];
const tailwindShades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

const colorOptions = tailwindColors.flatMap(color => 
  tailwindShades.map(shade => ({
    value: `bg-${color}-${shade}/40`,
    label: `bg-${color}-${shade}/40`
  }))
);

const accentOptions = tailwindColors.flatMap(color => 
  tailwindShades.map(shade => ({
    value: `text-${color}-${shade}`,
    label: `text-${color}-${shade}`
  }))
);

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    borderColor: state.isFocused ? '#22c55e' : '#374151',
    color: '#fff',
    minHeight: '46px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#22c55e' }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1a1a1a',
    border: '1px solid #374151',
    zIndex: 50
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#374151' : '#1a1a1a',
    color: '#fff',
    '&:active': { backgroundColor: '#22c55e' }
  }),
  singleValue: (base) => ({ ...base, color: '#fff' }),
  input: (base) => ({ ...base, color: '#fff' }),
  placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '14px' })
};

const typeOptions = [
  { value: "web", label: "Web App" },
  { value: "mobile", label: "Mobile App" }
];

const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" }
];

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeSaving, setResumeSaving] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const initialFormState = {
    title: "", type: "web", description: "", complexity: "", 
    url: "", link: "", tech: "", color: "bg-green-900/40", accent: "text-green-400", base64Image: "", isActive: true
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadProjects();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings.resumeUrl) {
        setResumeUrl(data.settings.resumeUrl);
      }
    } catch {}
  };

  const handleSaveResumeUrl = async () => {
    if (!resumeUrl.trim()) return;
    setResumeSaving(true);
    try {
      const res = await fetchWithAuth("/api/admin/settings/resumeUrl", {
        method: "PUT",
        body: { value: resumeUrl.trim() },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Resume URL saved!");
      } else {
        toast.error("Failed to save URL");
      }
    } catch {
      toast.error("Error saving URL");
    } finally {
      setResumeSaving(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, base64Image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const techArray = formData.tech.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { ...formData, tech: techArray };

    try {
      setProjectSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      
      const res = await fetchWithAuth(url, {
        method,
        body: payload
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Project updated" : "Project created");
        setFormData(initialFormState);
        setEditingId(null);
        loadProjects();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Failed to save project");
    } finally {
      setProjectSaving(false);
    }
  };

  const handleEdit = (proj) => {
    setEditingId(proj._id);
    setFormData({
      ...proj,
      tech: proj.tech ? proj.tech.join(", ") : ""
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const res = await fetchWithAuth(`/api/admin/projects/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          toast.success("Project deleted");
          loadProjects();
        } else {
          toast.error("Failed to delete");
        }
      } catch (err) {
        toast.error("Error deleting project");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-black text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin/analytics")}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-semibold"
            >
              <BarChart2 size={16} /> Analytics
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                {editingId ? <Edit size={20} className="text-blue-400"/> : <Plus size={20} className="text-green-500"/>} 
                {editingId ? "Edit Project" : "New Project"}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none" required />
                
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <Select
                      options={typeOptions}
                      styles={selectStyles}
                      placeholder="Select Project Type"
                      value={typeOptions.find(opt => opt.value === formData.type)}
                      onChange={opt => setFormData({...formData, type: opt.value})}
                    />
                  </div>
                  <div className="w-1/2">
                    <Select
                      options={statusOptions}
                      styles={selectStyles}
                      placeholder="Status"
                      value={statusOptions.find(opt => opt.value === formData.isActive) || statusOptions[0]}
                      onChange={opt => setFormData({...formData, isActive: opt.value})}
                    />
                  </div>
                </div>

                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm h-24 resize-none focus:border-green-500 outline-none" required />
                
                <textarea placeholder="Engineering Complexity" value={formData.complexity} onChange={e => setFormData({...formData, complexity: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm h-20 resize-none focus:border-green-500 outline-none" />

                <input type="text" placeholder="Technologies (comma separated)" value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none" required />
                
                <div className="flex gap-4">
                  <input type="text" placeholder="Live URL (ex: myapp.com)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-1/2 bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none" />
                  <input type="text" placeholder="Full Link (https://...)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-1/2 bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none" />
                </div>
                <div className="flex gap-4">
                  <div className="w-full">
                    <Select
                      options={colorOptions}
                      styles={selectStyles}
                      placeholder="Color class (bg-green-900/40)"
                      value={colorOptions.find(opt => opt.value === formData.color) || { value: formData.color, label: formData.color }}
                      onChange={opt => setFormData({...formData, color: opt.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-full">
                    <Select
                      options={accentOptions}
                      styles={selectStyles}
                      placeholder="Accent class (text-green-400)"
                      value={accentOptions.find(opt => opt.value === formData.accent) || { value: formData.accent, label: formData.accent }}
                      onChange={opt => setFormData({...formData, accent: opt.value})}
                    />
                  </div>
                </div>


                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Project Image</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500/10 file:text-green-500 hover:file:bg-green-500/20" />
                  {formData.base64Image && <img src={formData.base64Image} alt="Preview" className="mt-2 h-20 rounded object-cover" />}
                </div>

                <div className="flex gap-2 mt-4">
                  <button type="submit" disabled={projectSaving} className="flex-grow py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {projectSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        {editingId ? "Updating..." : "Saving..."}
                      </span>
                    ) : (
                      editingId ? "Update Project" : "Save Project"
                    )}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setFormData(initialFormState); }} className="px-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Existing Projects</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-64 animate-pulse">
                    <div className="w-full h-32 bg-gray-800/40"></div>
                    <div className="p-5 flex-grow flex flex-col">
                      <div className="h-5 bg-gray-800/40 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-800/40 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-800/40 rounded w-5/6 mb-4"></div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-800/50 mt-auto">
                        <div className="h-8 w-8 bg-gray-800/40 rounded-lg"></div>
                        <div className="h-8 w-8 bg-gray-800/40 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <p className="text-gray-400 bg-[#111111] p-6 rounded-2xl border border-gray-800">No projects found. Add one!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <div key={proj._id} className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                    {proj.base64Image ? (
                      <img src={proj.base64Image} alt={proj.title} className="w-full h-32 object-cover" />
                    ) : (
                      <div className={`w-full h-32 ${proj.color} flex items-center justify-center`}>
                        <span className={`text-4xl font-black ${proj.accent} opacity-30`}>{proj.title.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="p-5 flex-grow flex flex-col relative">
                      <div className="absolute top-2 right-2">
                        {proj.isActive !== false ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] uppercase font-bold rounded">Active</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] uppercase font-bold rounded">Inactive</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 pr-12">{proj.title}</h3>
                      <p className="text-gray-400 text-xs mb-4 flex-grow line-clamp-2">{proj.description}</p>
                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-800 mt-auto">
                        <button onClick={() => handleEdit(proj)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(proj._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="mt-16 pt-10 border-t border-gray-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Link size={20} className="text-green-400" /> Site Settings
          </h2>
          <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
            <label className="block text-sm font-semibold text-gray-400 mb-2">Resume PDF URL (Google Drive)</label>
            <p className="text-xs text-gray-600 mb-3">
              Paste your Google Drive share link (any format). The file must be set to <span className="text-gray-400 font-medium">"Anyone with the link"</span> in sharing settings.
              Supports: <code className="text-green-500">drive.google.com/file/d/...</code>
            </p>
            <div className="flex gap-3">
              <input
                type="url"
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
                className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none text-white"
              />
              <button
                onClick={handleSaveResumeUrl}
                disabled={resumeSaving}
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {resumeSaving ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {resumeSaving ? "Saving..." : "Save"}
              </button>
            </div>
            {resumeUrl && (
              <a
                href={`/resume`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-green-400 hover:underline text-xs"
              >
                Preview Resume Page →
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
