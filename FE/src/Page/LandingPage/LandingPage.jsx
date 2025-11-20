import { useState } from 'react';
import { Button, Card, Modal } from 'antd';
import { Building2, User, Zap, MapPin, Clock, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [registerModal, setRegisterModal] = useState(false);

  const features = [
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: 'Sạc Nhanh',
      description: 'Công nghệ sạc nhanh DC, đầy pin trong 30 phút'
    },
    {
      icon: <MapPin className="w-12 h-12 text-blue-500" />,
      title: 'Mạng Lưới Rộng',
      description: 'Hơn 100 trạm sạc trên toàn quốc'
    },
    {
      icon: <Clock className="w-12 h-12 text-green-500" />,
      title: '24/7 Hoạt Động',
      description: 'Sẵn sàng phục vụ mọi lúc, mọi nơi'
    },
    {
      icon: <Shield className="w-12 h-12 text-purple-500" />,
      title: 'An Toàn',
      description: 'Hệ thống bảo mật cao cấp, thanh toán đảm bảo'
    }
  ];

  const stats = [
    { number: '100+', label: 'Trạm Sạc', color: 'text-blue-600' },
    { number: '500+', label: 'Cổng Sạc', color: 'text-green-600' },
    { number: '10K+', label: 'Người Dùng', color: 'text-purple-600' },
    { number: '50K+', label: 'Lượt Sạc/Tháng', color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">EV Charging</h1>
            </div>
            <div className="flex gap-3">
              <Button size="large" onClick={() => navigate('/auth/login')}>
                Đăng Nhập
              </Button>
              <Button 
                type="primary" 
                size="large"
                onClick={() => setRegisterModal(true)}
                className="bg-blue-600"
              >
                Đăng Ký Ngay
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span className="text-blue-600 font-semibold">Hệ Thống Sạc Xe Điện Thông Minh</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Sạc Xe Điện
                <br />
                <span className="text-blue-600">Nhanh Chóng & Tiện Lợi</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Giải pháp sạc xe điện toàn diện cho cá nhân và doanh nghiệp. 
                Mạng lưới trạm sạc rộng khắp, công nghệ hiện đại, dịch vụ tận tâm.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<User className="w-5 h-5" />}
                  onClick={() => navigate('/auth/login', { state: 'signup' })}
                  className="bg-blue-600 h-14 text-lg"
                >
                  Đăng Ký Cá Nhân
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800" 
                  alt="EV Charging"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi?</h2>
            <p className="text-xl text-gray-600">Những lợi ích vượt trội khi sử dụng dịch vụ của chúng tôi</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Types Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Lựa Chọn Phù Hợp Với Bạn</h2>
            <p className="text-xl text-blue-100">Đăng ký ngay để trải nghiệm dịch vụ tốt nhất</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Personal Registration */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all">
                <div className="p-6">
                  <User className="w-16 h-16 text-blue-600 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Đăng Ký Cá Nhân</h3>
                  <p className="text-gray-600 mb-6">
                    Dành cho chủ xe điện cá nhân muốn sử dụng dịch vụ sạc xe linh hoạt
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-5 h-5 text-green-500" />
                      Thanh toán theo lượt sử dụng
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-5 h-5 text-green-500" />
                      Gói đăng ký linh hoạt
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-5 h-5 text-green-500" />
                      Quản lý phương tiện cá nhân
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-5 h-5 text-green-500" />
                      Đặt trước trạm sạc
                    </li>
                  </ul>
                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    onClick={() => navigate('/auth/login', { state: 'signup' })}
                    className="bg-blue-600"
                  >
                    Đăng Ký Cá Nhân
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Sẵn Sàng Bắt Đầu?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Tham gia cùng hàng nghìn người dùng đang tin tưởng dịch vụ của chúng tôi
          </p>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/auth/login', { state: 'signup' })}
            className="bg-blue-600 h-14 px-8 text-lg"
          >
            Đăng Ký Ngay - Miễn Phí
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
                <span className="text-white font-bold text-lg">EV Charging</span>
              </div>
              <p className="text-sm">
                Giải pháp sạc xe điện hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Dịch Vụ</h4>
              <ul className="space-y-2 text-sm">
                <li>Sạc Nhanh DC</li>
                <li>Sạc Chậm AC</li>
                <li>Đặt Trước</li>
                <li>Gói Đăng Ký</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-sm">
                <li>Trung Tâm Trợ Giúp</li>
                <li>Liên Hệ</li>
                <li>Câu Hỏi Thường Gặp</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Liên Hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 1900-xxxx</li>
                <li>📧 support@evcharging.vn</li>
                <li>📍 TP.HCM, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 EV Charging System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <Modal
        title={
          <div className="text-center">
            <h2 className="text-2xl font-bold">Chọn Loại Đăng Ký</h2>
          </div>
        }
        open={registerModal}
        onCancel={() => setRegisterModal(false)}
        footer={null}
        width={700}
      >
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card 
            hoverable
            onClick={() => {
              setRegisterModal(false);
              navigate('/auth/login', { state: 'signup' });
            }}
            className="text-center cursor-pointer hover:border-blue-500"
          >
            <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Cá Nhân</h3>
            <p className="text-gray-600 mb-4">
              Dành cho người dùng cá nhân
            </p>
            <Button type="primary" block className="bg-blue-600">
              Đăng Ký Ngay
            </Button>
          </Card>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
