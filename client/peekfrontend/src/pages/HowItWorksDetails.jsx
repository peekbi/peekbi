import { motion } from 'framer-motion';
import { FiCopy, FiDownload, FiCheck, FiArrowLeft, FiChevronUp, FiChevronDown, FiUser, FiCreditCard, FiUpload, FiBarChart2, FiMessageSquare, FiFileText, FiShare2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

const HowItWorksDetails = () => {
    const [copiedColumn, setCopiedColumn] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [copiedColumns, setCopiedColumns] = useState({});

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedColumns(prev => ({
                ...prev,
                [key]: true
            }));
            
            // Reset the copied state after 2 seconds
            setTimeout(() => {
                setCopiedColumns(prev => ({
                    ...prev,
                    [key]: false
                }));
            }, 2000);
            
            toast.success(`"${text}" copied to clipboard!`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const industryColumns = {
        retail: {
            title: "Retail Analytics",
            description: "Perfect for e-commerce, retail stores, and sales data analysis",
            columns: {
                quantity: ['qty', 'quantity', 'units sold', 'unitsold', 'sold quantity', 'sold_qty', 'order quantity', 'order_qty', 'qty sold'],
                unitPrice: ['unit price', 'unitprice', 'unit cost', 'unitcost', 'price', 'price per unit', 'rate', 'cost per item', 'item price'],
                sales: ['total', 'amount', 'sales', 'sale', 'revenue', 'gross sale', 'net sale', 'invoice value', 'total revenue', 'totalamount', 'total price', 'total_price', 'order value'],
                profit: ['profit', 'gross profit', 'net profit', 'profit margin', 'profit ($)', 'profit amount', 'margin'],
                cost: ['cost', 'purchase cost', 'total cost', 'purchase price', 'cost per unit', 'unit cost'],
                loss: ['loss', 'net loss', 'negative profit'],
                category: ['category', 'product', 'item', 'brand', 'segment', 'product category', 'sub category', 'subcategory'],
                region: ['region', 'area', 'zone', 'territory', 'location', 'market'],
                date: ['date', 'order date', 'timestamp', 'sale date', 'datetime', 'transaction date'],
                customer: ['customer', 'customer id', 'client', 'user', 'customer name', 'client id', 'user id'],
                returnFlag: ['return', 'returned', 'is return', 'is_return', 'returned (y/n)', 'return status', 'was returned', 'isreturned'],
                promotionFlag: ['promo', 'discount', 'promotion', 'promotion applied (y/n)', 'is_discounted', 'discount applied', 'discountflag']
            }
        },
        manufacturing: {
            title: "Manufacturing Analytics",
            description: "Ideal for production data, quality control, and operational efficiency",
            columns: {
                prodCol: ['produce', 'unit', 'output', 'volume', 'production', 'unitproduced', 'unitsproduced', 'product_id'],
                costCol: ['cost', 'expense', 'spend', 'productioncost', 'repair_cost'],
                qualityCol: ['defect', 'quality', 'reject', 'scrap', 'defectrate', 'defect_id'],
                machineCol: ['machine', 'downtime', 'uptime', 'maintenance', 'machineuptime', 'machinedowntime', 'machinemaintenance'],
                leadTimeCol: ['leadtime', 'delivery', 'supply'],
                materialCol: ['material', 'raw', 'input'],
                energyCol: ['energy', 'power', 'electricity'],
                laborCol: ['labor', 'workforce', 'staff', 'manpower'],
                dateCol: ['date', 'period', 'time', 'timestamp', 'month', 'defect_date']
            }
        },
        finance: {
            title: "Financial Analytics",
            description: "Perfect for financial statements, transactions, and revenue analysis",
            columns: {
                revenueCol: ['revenue', 'sales', 'amount', 'income', 'checking', 'transaction'],
                expenseCol: ['expense', 'cost', 'spend', 'debit', 'withdrawal'],
                dateCol: ['date', 'timestamp', 'period', 'time', 'month', 'year'],
                metricCol: ['metric', 'type', 'category', 'label'],
                customerCol: ['customer', 'client', 'user', 'sme', 'enterprise', 'retail']
            }
        },
        education: {
            title: "Education Analytics",
            description: "Ideal for academic performance, student data, and institutional metrics",
            columns: {
                scoreCol: ['score', 'marks', 'grade', 'result', 'performance'],
                studentCol: ['student', 'name', 'learner'],
                subjectCol: ['subject', 'course', 'class'],
                dateCol: ['year', 'date', 'month', 'timestamp'],
                attendanceCol: ['attendance', 'present', 'absent', 'attendancerate'],
                completionCol: ['completion', 'status', 'coursecompleted', 'completionrate'],
                resourceCol: ['resource', 'usage', 'time', 'hour', 'videos'],
                teacherCol: ['teacher', 'instructor', 'faculty'],
                budgetCol: ['budget', 'cost', 'expenditure'],
                alumniCol: ['alumni', 'employed', 'career', 'placement'],
                infrastructureCol: ['lab', 'library', 'facility', 'infrastructure'],
                enrollmentCol: ['enrollment', 'registered', 'join'],
                dropoutCol: ['dropout', 'retention', 'left']
            }
        },
        healthcare: {
            title: "Healthcare Analytics",
            description: "Perfect for patient data, medical records, and healthcare metrics",
            columns: {
                admissionCol: ['admission', 'visit', 'encounter', 'number'],
                departmentCol: ['department', 'unit', 'ward'],
                diseaseCol: ['disease', 'diagnosis', 'condition', 'icd'],
                treatmentCol: ['treatment', 'therapy', 'procedure'],
                outcomeCol: ['outcome', 'result', 'status'],
                bedCol: ['bed', 'occupancy', 'room', 'number'],
                staffCol: ['staff', 'nurse', 'doctor', 'personnel'],
                equipmentCol: ['equipment', 'machine', 'device'],
                insuranceCol: ['insurance', 'payer', 'claim'],
                medicationCol: ['medication', 'drug', 'prescription', 'rx'],
                dateCol: ['date', 'admission date', 'timestamp', 'period']
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#7400B8] hover:text-[#9B4DCA] transition-colors mb-6">
                        <FiArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Back to Home</span>
                    </Link>
                    <h1 className="text-5xl font-bold text-gray-800 mb-6">Complete Guide to PeekBI Analytics</h1>
                    <p className="text-xl text-gray-600 max-w-4xl">Transform your business data into actionable insights with our comprehensive AI-powered analytics platform. From account setup to advanced analysis, learn everything you need to make data-driven decisions.</p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column - Main Article */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Getting Started Section */}
                        <motion.div
                            className="bg-white rounded-3xl p-10 shadow-xl border border-[#7400B8]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-2xl flex items-center justify-center">
                                    <FiUser className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-[#7400B8]">Getting Started with PeekBI</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="bg-gradient-to-r from-[#F9F4FF] to-white rounded-2xl p-6 border border-[#7400B8]/20">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Step 1: Create Your Account</h3>
                                    <p className="text-gray-700 mb-4">
                                        Begin your analytics journey by creating a PeekBI account. Our platform offers flexible plans designed to meet your business needs:
                                    </p>
                                    <ul className="space-y-3 text-gray-700">
                                        <li className="flex items-start gap-3">
                                            <FiCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <span><strong>Free Plan:</strong> Perfect for individuals and small businesses. Includes 10 file uploads, basic analytics, and 5 AI prompts per month.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <FiCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <span><strong>Professional Plan:</strong> Ideal for growing businesses. Features 100 uploads, advanced analytics, 50 AI prompts, and priority support.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <FiCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <span><strong>Enterprise Plan:</strong> Designed for large organizations. Unlimited uploads, custom analytics, 500 AI prompts, and dedicated support.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-r from-[#F9F4FF] to-white rounded-2xl p-6 border border-[#7400B8]/20">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Step 2: Choose Your Subscription</h3>
                                    <p className="text-gray-700 mb-4">
                                        Select the plan that best fits your analytics requirements. All plans include:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-700">Secure data processing</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-700">Industry-specific analysis</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-700">Interactive dashboards</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-700">PDF report export</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-700">AI-powered insights</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="w-4 h-4 text-green-500" />
                                                <span className="text-gray-700">24/7 platform access</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Data Preparation Section */}
                        <motion.div
                            className="bg-white rounded-3xl p-10 shadow-xl border border-[#7400B8]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-2xl flex items-center justify-center">
                                    <FiFileText className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-[#7400B8]">Data Preparation & Upload</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Preparing Your Data for Analysis</h3>
                                    <p className="text-gray-700 mb-6">
                                        Proper data preparation is crucial for accurate analysis. Follow these best practices to ensure optimal results:
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h4 className="font-bold text-gray-800 mb-3">Data Format Requirements</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li>• Excel (.xlsx, .xls) or CSV files</li>
                                                <li>• Maximum file size: 50MB</li>
                                                <li>• UTF-8 encoding for special characters</li>
                                                <li>• First row should contain column headers</li>
                                            </ul>
                                        </div>
                                        
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h4 className="font-bold text-gray-800 mb-3">Data Quality Checklist</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li>• Remove duplicate entries</li>
                                                <li>• Fix inconsistent formatting</li>
                                                <li>• Ensure date columns are properly formatted</li>
                                                <li>• Handle missing values appropriately</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-[#F9F4FF] to-white rounded-2xl p-6 border border-[#7400B8]/20">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Column Naming Best Practices</h3>
                                    <p className="text-gray-700 mb-4">
                                        Use consistent, descriptive column names that PeekBI can recognize. Our AI automatically detects common column patterns, but following these guidelines ensures optimal analysis:
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <FiCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Use Clear, Descriptive Names</h4>
                                                <p className="text-gray-600">Instead of "col1", use "sales_amount" or "customer_name"</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FiCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Include Date Columns</h4>
                                                <p className="text-gray-600">Date information enables trend analysis and seasonal pattern detection</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FiCheck className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Avoid Special Characters</h4>
                                                <p className="text-gray-600">Use underscores or hyphens instead of spaces or special characters</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Analysis Process Section */}
                        <motion.div
                            className="bg-white rounded-3xl p-10 shadow-xl border border-[#7400B8]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-2xl flex items-center justify-center">
                                    <FiBarChart2 className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-[#7400B8]">AI-Powered Analysis Process</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 mb-2">Data Upload & Validation</h3>
                                                <p className="text-gray-600">Upload your file through our secure interface. PeekBI automatically validates data format and structure.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 mb-2">Column Recognition</h3>
                                                <p className="text-gray-600">Our AI identifies column types and maps them to industry-specific analytics categories.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 mb-2">Pattern Analysis</h3>
                                                <p className="text-gray-600">Advanced algorithms detect trends, correlations, and anomalies in your data.</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 mb-2">Insight Generation</h3>
                                                <p className="text-gray-600">Generate comprehensive reports with charts, summaries, and actionable recommendations.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 mb-2">Interactive Dashboards</h3>
                                                <p className="text-gray-600">Explore your data through interactive visualizations and drill-down capabilities.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">6</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 mb-2">Export & Share</h3>
                                                <p className="text-gray-600">Download reports as PDFs or share insights with your team through secure links.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Assistant Section */}
                        <motion.div
                            className="bg-white rounded-3xl p-10 shadow-xl border border-[#7400B8]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-2xl flex items-center justify-center">
                                    <FiMessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-[#7400B8]">AI Assistant & Advanced Features</h2>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="bg-gradient-to-r from-[#F9F4FF] to-white rounded-2xl p-6 border border-[#7400B8]/20">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Interactive AI Assistant</h3>
                                    <p className="text-gray-700 mb-6">
                                        When you need deeper insights or have specific questions about your data, our AI Assistant is here to help:
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3">Ask Questions Naturally</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li>• "What are the top performing products?"</li>
                                                <li>• "Show me sales trends by region"</li>
                                                <li>• "Identify seasonal patterns"</li>
                                                <li>• "Compare performance across periods"</li>
                                            </ul>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-3">AI-Powered Insights</h4>
                                            <ul className="space-y-2 text-gray-700">
                                                <li>• Automatic anomaly detection</li>
                                                <li>• Predictive analytics</li>
                                                <li>• Custom chart generation</li>
                                                <li>• Actionable recommendations</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="w-10 h-10 bg-[#7400B8] rounded-lg flex items-center justify-center mb-4">
                                            <FiShare2 className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2">Share & Collaborate</h4>
                                        <p className="text-gray-600">Share dashboards and reports with team members through secure, password-protected links.</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="w-10 h-10 bg-[#7400B8] rounded-lg flex items-center justify-center mb-4">
                                            <FiDownload className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2">Export Options</h4>
                                        <p className="text-gray-600">Download reports as PDFs, Excel files, or integrate with your existing business intelligence tools.</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="w-10 h-10 bg-[#7400B8] rounded-lg flex items-center justify-center mb-4">
                                            <FiBarChart2 className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-2">Custom Dashboards</h4>
                                        <p className="text-gray-600">Create personalized dashboards with your most important KPIs and metrics for quick access.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Troubleshooting Section */}
                        <motion.div
                            className="bg-white rounded-3xl p-10 shadow-xl border border-[#7400B8]/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-bold text-[#7400B8] mb-8">Troubleshooting & Best Practices</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                                    <h3 className="text-lg font-bold text-yellow-800 mb-3">Common Issues & Solutions</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-yellow-800">Analysis Not Providing Insights?</h4>
                                            <p className="text-yellow-700">Try using our AI Assistant by clicking the "Ask AI" button. Ask specific questions about your data to get targeted insights.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-yellow-800">Column Names Not Recognized?</h4>
                                            <p className="text-yellow-700">Click on the column names below to copy them, then update your Excel file with these exact names for optimal results.</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-yellow-800">Data Not Loading Properly?</h4>
                                            <p className="text-yellow-700">Ensure your file is in Excel (.xlsx) or CSV format, with headers in the first row and consistent data formatting.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-bold text-green-800 mb-3">Pro Tips for Better Results</h3>
                                    <ul className="space-y-2 text-green-700">
                                        <li>• Start with our sample files to understand the expected format</li>
                                        <li>• Use consistent date formats (YYYY-MM-DD recommended)</li>
                                        <li>• Include at least 100 rows of data for meaningful analysis</li>
                                        <li>• Clean your data before uploading (remove duplicates, fix formatting)</li>
                                        <li>• Use descriptive column names that match our recommendations</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Column Names & Downloads */}
                    <div className="space-y-8">
                        {/* Sample Files */}
                        <motion.div
                            className="bg-white rounded-3xl p-8 shadow-xl border border-[#7400B8]/10"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h3 className="text-2xl font-bold text-[#7400B8] mb-6">Download Sample Files</h3>
                            <p className="text-gray-600 mb-6">Start with our industry-specific sample files to understand the expected format and see PeekBI in action.</p>
                            <div className="space-y-4">
                                {Object.entries(industryColumns).map(([key, industry]) => (
                                    <a
                                        key={key}
                                        href={`/files/${key}_sample_peekbi.xlsx`}
                                        download
                                        className="block w-full px-6 py-4 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-semibold text-center hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                                    >
                                        <FiDownload className="w-5 h-5" />
                                        {industry.title}
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Column Names by Industry */}
                        {Object.entries(industryColumns).map(([key, industry], index) => (
                            <motion.div
                                key={key}
                                className="bg-white rounded-3xl p-8 shadow-xl border border-[#7400B8]/10"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-[#7400B8]">{industry.title}</h3>
                                    <button
                                        onClick={() => setExpandedSections(prev => ({
                                            ...prev,
                                            [key]: !prev[key]
                                        }))}
                                        className="text-[#7400B8] hover:text-[#9B4DCA] transition-colors p-2 rounded-lg hover:bg-[#F9F4FF]"
                                    >
                                        {expandedSections[key] ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-gray-600 text-sm mb-6">{industry.description}</p>
                                
                                {expandedSections[key] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        {Object.entries(industry.columns).map(([colKey, columns]) => (
                                            <div key={colKey} className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="font-bold text-gray-800 mb-3 capitalize">
                                                    {colKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {columns.map((col, colIndex) => (
                                                        <motion.button
                                                            key={`${key}-${colKey}-${colIndex}`}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => copyToClipboard(col, `${key}-${colKey}-${colIndex}`)}
                                                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                                                                copiedColumns[`${key}-${colKey}-${colIndex}`]
                                                                    ? 'bg-green-100 text-green-700 border-green-300'
                                                                    : 'bg-white text-[#7400B8] border-[#7400B8] hover:bg-[#7400B8] hover:text-white'
                                                            }`}
                                                        >
                                                            {col}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksDetails; 