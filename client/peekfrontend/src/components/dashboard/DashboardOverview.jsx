import React from 'react';
import { motion } from 'framer-motion';
import FilesList from './FilesList';

const DashboardOverview = ({ 
    userFiles, 
    selectedFile, 
    setSelectedFile, 
    isLoadingAnalysis, 
    analysis, 
    analysisError, 
    handleLoadFileAnalysis,
    navigate 
}) => {
    return (
        <div className="space-y-8">
            <FilesList 
                userFiles={userFiles}
                isLoadingFiles={false}
                fileError={null}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                isLoadingAnalysis={isLoadingAnalysis}
                analysis={analysis}
                handleLoadFileAnalysis={handleLoadFileAnalysis}
            />
        </div>
    );
};

export default DashboardOverview; 