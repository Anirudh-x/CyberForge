import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  AlertTriangle,
  Target,
  Building2,
  Globe,
  Crosshair,
  Gauge,
  Loader2,
  Copy,
  CheckCircle,
  ShieldAlert,
  Eye,
  FileWarning,
  X,
  Star,
  Flag,
  Info,
  MailCheck,
  User,
  Users,
  CalendarCheck,
  ArrowRightCircle
} from 'lucide-react';

const ROLES = [
  'Software Engineer',
  'HR Manager',
  'Finance Director',
  'CEO/Executive',
  'IT Administrator',
  'Sales Representative',
  'Marketing Manager',
  'Customer Support',
  'Legal Counsel',
  'Operations Manager',
  'Data Analyst',
  'Project Manager'
];

const ORG_TYPES = [
  'Tech Startup',
  'Healthcare Organization',
  'Financial Institution',
  'Government Agency',
  'Educational Institution',
  'Retail Company',
  'Manufacturing Firm',
  'Legal Firm',
  'Non-Profit Organization',
  'E-commerce Business',
  'Consulting Firm',
  'Media Company'
];

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Middle East',
  'Latin America'
];

const ATTACK_GOALS = [
  { label: 'Credential Harvesting', value: 'credentials' },
  { label: 'Malware Delivery', value: 'malware' },
  { label: 'Financial Fraud', value: 'financial' },
  { label: 'Data Exfiltration', value: 'data' },
  { label: 'System Access', value: 'access' }
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', description: 'Obvious red flags', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', description: 'Subtle deception', color: 'text-yellow-400' },
  { value: 'hard', label: 'Hard', description: 'Highly convincing', color: 'text-red-400' }
];

const PhishingGenerator = ({ isOpen, onClose, onEmailGenerated }) => {
  const [formData, setFormData] = useState({
    employee_role: '',
    org_type: '',
    region: '',
    attack_goal: '',
    difficulty: 'medium'
  });
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleGenerate = async () => {
    // Validate form
    const missingFields = Object.entries(formData)
      .filter(([key, value]) => !value)
      .map(([key]) => key.replace('_', ' '));

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedEmail(null);

    try {
      const response = await fetch('/api/phishing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedEmail(data.data);
        if (onEmailGenerated) {
          onEmailGenerated(data.data);
        }
      } else if (response.status === 429) {
        // Rate limited
        const retryAfter = data.retryAfter || 20;
        setError(`API rate limit reached. Please wait ${retryAfter} seconds and try again.`);
      } else {
        setError(data.error || 'Failed to generate phishing email');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedEmail) return;

    const emailText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    await navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedEmail(null);
    setShowRedFlags(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-green-900/50 rounded-lg shadow-[0_0_60px_rgba(34,197,94,0.15)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-900/50 bg-green-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-green-100 tracking-wide">Phishing Email Generator</h2>
                <p className="text-xs text-green-600">Social Engineering Simulation Tool</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-green-600 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
            <div className="p-6">
              {!generatedEmail ? (
                /* Configuration Form */
                <div className="space-y-6">
                  {/* Educational Warning */}
                  <div className="flex items-start gap-3 p-4 bg-yellow-950/30 border border-yellow-600/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-yellow-200 font-medium">Educational Purpose Only</p>
                      <p className="text-yellow-600 mt-1">
                        This tool generates simulated phishing emails for security awareness training.
                        Generated content contains no real malicious elements.
                      </p>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Target Role */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
                        <Target className="w-4 h-4" />
                        Target Role
                      </label>
                      <select
                        value={formData.employee_role}
                        onChange={(e) => handleInputChange('employee_role', e.target.value)}
                        className="w-full bg-black border border-green-900/50 rounded-lg px-4 py-3 text-green-100 focus:outline-none focus:border-green-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select target role...</option>
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    {/* Organization Type */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
                        <Building2 className="w-4 h-4" />
                        Organization Type
                      </label>
                      <select
                        value={formData.org_type}
                        onChange={(e) => handleInputChange('org_type', e.target.value)}
                        className="w-full bg-black border border-green-900/50 rounded-lg px-4 py-3 text-green-100 focus:outline-none focus:border-green-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select organization type...</option>
                        {ORG_TYPES.map(org => (
                          <option key={org} value={org}>{org}</option>
                        ))}
                      </select>
                    </div>

                    {/* Region */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
                        <Globe className="w-4 h-4" />
                        Target Region
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        className="w-full bg-black border border-green-900/50 rounded-lg px-4 py-3 text-green-100 focus:outline-none focus:border-green-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select region...</option>
                        {REGIONS.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>

                    {/* Attack Goal */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
                        <Crosshair className="w-4 h-4" />
                        Attack Goal
                      </label>
                      <select
                        value={formData.attack_goal}
                        onChange={(e) => handleInputChange('attack_goal', e.target.value)}
                        className="w-full bg-black border border-green-900/50 rounded-lg px-4 py-3 text-green-100 focus:outline-none focus:border-green-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select attack goal...</option>
                        {ATTACK_GOALS.map(goal => (
                          <option key={goal.value} value={goal.label}>{goal.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
                      <Gauge className="w-4 h-4" />
                      Detection Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {DIFFICULTIES.map(diff => (
                        <button
                          key={diff.value}
                          onClick={() => handleInputChange('difficulty', diff.value)}
                          className={`p-4 rounded-lg border transition-all text-left ${formData.difficulty === diff.value
                            ? 'bg-green-500/10 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                            : 'bg-black border-green-900/30 hover:border-green-700'
                            }`}
                        >
                          <div className={`font-bold ${diff.color}`}>{diff.label}</div>
                          <div className="text-xs text-green-700 mt-1">{diff.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-600/30 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-400">{error}</span>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-bold py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:shadow-none"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Phishing Email...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Generate Phishing Email
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Generated Email Display */
                <div className="space-y-6">
                  {/* Email Preview */}
                  <div className="bg-black border border-green-900/50 rounded-lg overflow-hidden">
                    {/* Email Header */}
                    <div className="p-4 border-b border-green-900/30 bg-green-950/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 uppercase tracking-wider font-bold">Generated Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-xs rounded transition-colors"
                          >
                            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-green-700 w-16">Subject:</span>
                          <span className="text-green-100 font-medium text-sm">{generatedEmail.subject}</span>
                        </div>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="p-6 bg-gradient-to-b from-transparent to-green-950/5">
                      <div className="text-green-200 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                        {generatedEmail.body}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phishing Technique */}
                    <div className="p-4 bg-green-950/20 border border-green-900/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-500 uppercase tracking-wider font-bold">Technique Used</span>
                      </div>
                      <p className="text-green-100 font-medium">{generatedEmail.phishing_technique}</p>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 bg-green-950/20 border border-green-900/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <FileWarning className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-500 uppercase tracking-wider font-bold">Configuration</span>
                      </div>
                      <div className="text-xs space-y-1 text-green-400">
                        <div><span className="text-green-700">Target:</span> {generatedEmail.metadata?.target_role}</div>
                        <div><span className="text-green-700">Org:</span> {generatedEmail.metadata?.organization_type}</div>
                        <div><span className="text-green-700">Difficulty:</span> <span className={
                          generatedEmail.metadata?.difficulty === 'easy' ? 'text-green-400' :
                            generatedEmail.metadata?.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                        }>{generatedEmail.metadata?.difficulty?.toUpperCase()}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Red Flags Toggle */}
                  <div className="border border-yellow-600/30 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowRedFlags(!showRedFlags)}
                      className="w-full flex items-center justify-between p-4 bg-yellow-950/20 hover:bg-yellow-950/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-200 font-bold text-sm">
                          {showRedFlags ? 'Hide' : 'Reveal'} Red Flags ({generatedEmail.red_flags?.length || 0})
                        </span>
                      </div>
                      <AlertTriangle className={`w-4 h-4 text-yellow-500 transition-transform ${showRedFlags ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showRedFlags && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-yellow-950/10 border-t border-yellow-600/20">
                            <ul className="space-y-2">
                              {generatedEmail.red_flags?.map((flag, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-yellow-200">{flag}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleReset}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 font-bold py-3 rounded-lg transition-all border border-green-900/50"
                    >
                      Generate Another
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #064e3b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </AnimatePresence>
  );
};

export default PhishingGenerator;
