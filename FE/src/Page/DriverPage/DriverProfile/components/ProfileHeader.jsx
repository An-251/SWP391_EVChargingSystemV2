import { ArrowLeft, User, Camera } from 'lucide-react';
import { Upload, Button } from 'antd';

const ProfileHeader = ({ 
  user, 
  avatarUrl, 
  isEditing, 
  onAvatarChange, 
  onBackClick 
}) => {
  return (
    <>
      {/* Sticky Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h1>
              <p className="text-sm text-gray-500">Cập nhật thông tin tài khoản của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <Upload
                name="avatar"
                listType="picture"
                className="absolute -bottom-2 -right-2"
                showUploadList={false}
                onChange={onAvatarChange}
              >
                <Button
                  size="small"
                  type="primary"
                  shape="circle"
                  icon={<Camera className="w-4 h-4" />}
                />
              </Upload>
            )}
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">{user?.fullName || user?.username}</h2>
            <p className="text-green-100">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="bg-green-400 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">Driver</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
