import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SlotStatus = 'pending' | 'ready' | 'auto';

interface LayoutSlot {
  id: number;
  name: string;
  position: string;
  hint: string;
  status: SlotStatus;
  asset?: string;
}

interface ActivityEntry {
  title: string;
  detail: string;
  time: string;
  tone: 'success' | 'info' | 'warn';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected layoutTitle = 'AI ghép ảnh layout miễn phí';
  protected layoutImage = 'Chưa có ảnh layout';
  protected layoutDescription =
    'Cung cấp layout có đánh dấu vị trí cần thay thế, AI sẽ ghép các ảnh/QR miễn phí và gợi ý dữ liệu còn thiếu.';
  protected aiPrompt =
    'Căn ảnh theo đánh dấu trên layout, ưu tiên giữ nguyên kích thước, không méo hình. Nếu thiếu ảnh sẽ sinh gợi ý tiếng Việt.';

  protected layoutSlots: LayoutSlot[] = [
    {
      id: 1,
      name: 'Logo thương hiệu',
      position: 'Góc trái trên (120x120)',
      hint: 'Giữ nền trong suốt, ưu tiên PNG.',
      status: 'pending',
      asset: 'logo.png'
    },
    {
      id: 2,
      name: 'Ảnh chính',
      position: 'Giữa khung (800x520)',
      hint: 'Dùng ảnh gốc hoặc kết quả AI.',
      status: 'ready',
      asset: 'banner-golf.png'
    },
    {
      id: 3,
      name: 'Mã QR',
      position: 'Góc phải dưới (180x180)',
      hint: 'Sinh tự động từ link đặt sân.',
      status: 'auto',
      asset: 'qrcode.png'
    }
  ];

  protected fieldValues: Record<number, string> = {
    1: 'Logo câu lạc bộ',
    2: 'Ảnh sân golf (từ AI miễn phí)',
    3: 'Link đặt sân được mã hóa QR'
  };

  protected newSlot = { name: '', position: '', hint: '' };

  protected activityLog: ActivityEntry[] = [
    {
      title: 'Dò tọa độ layout',
      detail: 'AI đã nhận diện các vùng cần thay thế từ file layout PNG.',
      time: 'Vừa xong',
      tone: 'success'
    },
    {
      title: 'Tạo caption gợi ý',
      detail: 'Sinh prompt tiếng Việt để người dùng tải ảnh phù hợp.',
      time: '1 phút trước',
      tone: 'info'
    },
    {
      title: 'Sinh QR miễn phí',
      detail: 'Chuyển link đặt sân thành mã QR và căn chỉnh kích thước.',
      time: '3 phút trước',
      tone: 'success'
    }
  ];

  protected previewNotes = [
    'Xem nhanh bố cục trước khi kết xuất.',
    'Nhấn "Xuất ảnh" để khóa trạng thái các vùng đã đủ dữ liệu.',
    'Các vùng thiếu sẽ được đánh dấu màu vàng để bạn bổ sung.'
  ];

  protected showPreview = false;

  protected get completedSlots(): number {
    return this.layoutSlots.filter((slot) => slot.status !== 'pending').length;
  }

  protected handleLayoutUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.layoutImage = file.name;
      this.pushLog('Tải layout mới', `Đã nhận "${file.name}" và cập nhật đánh dấu vùng AI.`, 'info');
    }
  }

  protected pushLog(title: string, detail: string, tone: ActivityEntry['tone']): void {
    const newEntry: ActivityEntry = { title, detail, time: 'Ngay bây giờ', tone };
    this.activityLog = [newEntry, ...this.activityLog].slice(0, 8);
  }

  protected updateValue(id: number, value: string): void {
    this.fieldValues = { ...this.fieldValues, [id]: value };
    this.layoutSlots = this.layoutSlots.map((slot) => {
      if (slot.id === id) {
        return { ...slot, status: value ? 'ready' : slot.status === 'auto' ? 'auto' : 'pending' };
      }
      return slot;
    });
  }

  protected addSlot(): void {
    const { name, position, hint } = this.newSlot;
    if (!name.trim() || !position.trim()) {
      return;
    }

    const id = Date.now();
    this.layoutSlots = [
      ...this.layoutSlots,
      { id, name: name.trim(), position: position.trim(), hint: hint.trim() || 'Điền hướng dẫn ngắn', status: 'pending' }
    ];
    this.fieldValues = { ...this.fieldValues, [id]: '' };
    this.newSlot = { name: '', position: '', hint: '' };
    this.pushLog('Thêm vùng ghép mới', `Đã tạo vùng "${name}" theo tọa độ ${position}.`, 'info');
  }

  protected generatePreview(): void {
    this.showPreview = true;
    this.pushLog('Tạo preview AI', 'Ghép các trường mẫu vào layout để kiểm tra căn chỉnh.', 'success');
  }

  protected resetBoard(): void {
    this.showPreview = false;
    this.layoutSlots = this.layoutSlots.map((slot) => {
      if (slot.status === 'auto' || slot.status === 'ready') {
        return slot;
      }
      return { ...slot, status: 'pending' };
    });
    this.pushLog('Làm mới', 'Xóa trạng thái cảnh báo và chờ dữ liệu mới.', 'warn');
  }
}
