import React from 'react';
import { VideoDetails } from '../types';
import { Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPreviewProps {
  videoDetails: VideoDetails;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoDetails }) => {
  const { title, channelTitle, publishedAt, thumbnail } = videoDetails;
  
  // Format the published date
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
    >
      <div className="relative md:w-1/3 h-48 md:h-auto">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback thumbnail if the original fails to load
            e.currentTarget.src = 'https://i.ytimg.com/vi/default/hqdefault.jpg';
          }}
        />
      </div>
      
      <div className="p-5 flex-1">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <User className="h-4 w-4 mr-1" />
          <span className="text-sm">{channelTitle}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="text-sm">{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPreview;