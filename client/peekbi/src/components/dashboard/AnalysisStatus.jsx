import { motion } from 'framer-motion';

const AnalysisStatus = ({ selectedFile, isLoadingAnalysis, analysisError, analysis }) => {
    if (!selectedFile) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
            <h3 className="text-xl font-semibold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-transparent bg-clip-text mb-4">
                Analysis Status
            </h3>
            <div className="space-y-4">
                {isLoadingAnalysis ? (
                    <div className="flex items-center space-x-3 bg-[#F9F4FF] p-4 rounded-xl">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7400B8]"></div>
                        <p className="text-sm text-[#7400B8]">Processing analysis...</p>
                    </div>
                ) : analysisError ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                        {analysisError}
                    </div>
                ) : analysis ? (
                    <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Analysis complete</span>
                    </div>
                ) : (
                    <div className="bg-gray-50 text-gray-600 p-4 rounded-xl text-sm">
                        Click "Analyze Data" to process file
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AnalysisStatus;