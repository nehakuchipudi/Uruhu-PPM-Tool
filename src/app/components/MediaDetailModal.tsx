import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  X,
  Download,
  Share2,
  Trash2,
  MapPin,
  Clock,
  User,
  FileText,
  Image as ImageIcon,
  Video,
  Calendar,
  Tag,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  timestamp: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  tags?: string[];
  description?: string;
  relatedTo?: string;
  dimensions?: string;
  device?: string;
}

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaFile;
  allMedia?: MediaFile[];
  onNext?: () => void;
  onPrevious?: () => void;
  onDelete?: (id: string) => void;
}

export function MediaDetailModal({
  isOpen,
  onClose,
  media,
  allMedia,
  onNext,
  onPrevious,
  onDelete,
}: MediaDetailModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const currentIndex = allMedia?.findIndex((m) => m.id === media.id) ?? -1;
  const hasNext = allMedia && currentIndex < allMedia.length - 1;
  const hasPrevious = allMedia && currentIndex > 0;

  const handleZoomIn = () => setZoom(Math.min(zoom + 25, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 25, 50));
  const handleRotate = () => setRotation((rotation + 90) % 360);

  const openInMaps = () => {
    if (media.geoLocation) {
      window.open(
        `https://www.google.com/maps?q=${media.geoLocation.latitude},${media.geoLocation.longitude}`,
        '_blank'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="w-full h-full flex">
        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Controls */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              <h3 className="text-white font-semibold">{media.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              {(media.type === 'image' || media.type === 'video') && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    className="text-white hover:bg-white/20"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-white text-sm">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="text-white hover:bg-white/20"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  {media.type === 'image' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRotate}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(media.id)}
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Media Display */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {hasPrevious && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="absolute left-4 text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {media.type === 'image' && (
              <img
                src={media.url}
                alt={media.name}
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s',
                }}
              />
            )}

            {media.type === 'video' && (
              <video
                src={media.url}
                controls
                className="max-w-full max-h-full"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transition: 'transform 0.2s',
                }}
              />
            )}

            {media.type === 'document' && (
              <div className="text-center text-white">
                <FileText className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">{media.name}</p>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </Button>
              </div>
            )}

            {hasNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="absolute right-4 text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-96 bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* File Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">File Information</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">File Name</p>
                    <p className="text-sm font-medium text-gray-900">{media.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">File Size</p>
                    <p className="text-sm font-medium text-gray-900">{media.size}</p>
                  </div>
                </div>

                {media.dimensions && (
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Dimensions</p>
                      <p className="text-sm font-medium text-gray-900">{media.dimensions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Info */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Upload Details</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Uploaded By</p>
                    <p className="text-sm font-medium text-gray-900">{media.uploadedBy}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Upload Date</p>
                    <p className="text-sm font-medium text-gray-900">{media.uploadedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Timestamp</p>
                    <p className="text-sm font-medium text-gray-900">{media.timestamp}</p>
                  </div>
                </div>

                {media.device && (
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Device</p>
                      <p className="text-sm font-medium text-gray-900">{media.device}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Geo Location */}
            {media.geoLocation && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Location</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {media.geoLocation.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Coordinates</p>
                      <p className="text-sm font-medium text-gray-900">
                        {media.geoLocation.latitude.toFixed(6)},{' '}
                        {media.geoLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={openInMaps}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View in Google Maps
                  </Button>
                </div>
              </div>
            )}

            {/* Tags */}
            {media.tags && media.tags.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {media.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {media.description && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Description</h4>
                <p className="text-sm text-gray-600">{media.description}</p>
              </div>
            )}

            {/* Related To */}
            {media.relatedTo && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Related To</h4>
                <Badge className="bg-blue-500">
                  {media.relatedTo}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
