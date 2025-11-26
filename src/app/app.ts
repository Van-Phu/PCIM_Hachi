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
  protected layoutTitle = 'AI ghép ảnh theo layout có sẵn';
  protected layoutImage = 'Chưa có ảnh layout';
  protected layoutDescription =
    'Tải layout có đánh dấu sẵn, cung cấp tên sản phẩm, ảnh sản phẩm, logo, background, màu/kiểu/kích thước chữ để AI ghép thành ảnh hoàn chỉnh miễn phí.';
  protected aiPrompt =
    'Cắt ảnh theo vùng layout, giữ tỉ lệ gốc, ghép logo + ảnh sản phẩm + ảnh thuộc tính lên background. Áp dụng màu chữ, kiểu chữ, kích thước chữ bạn nhập.';

  protected layoutSlots: LayoutSlot[] = [
    {
      id: 1,
      name: 'Logo sản phẩm',
      position: 'Góc trái trên (120x120)',
      hint: 'PNG nền trong suốt, giữ tỉ lệ.',
      status: 'pending',
      asset: 'logo.png'
    },
    {
      id: 2,
      name: 'Ảnh nền',
      position: 'Full khung (1920x1080)',
      hint: 'Background hoặc texture bạn cung cấp.',
      status: 'auto',
      asset: 'background.png'
    },
    {
      id: 3,
      name: 'Ảnh sản phẩm chính',
      position: 'Giữa khung (900x700)',
      hint: 'Ảnh PNG/JPG độ nét cao.',
      status: 'pending',
      asset: 'product-main.png'
    },
    {
      id: 4,
      name: 'Ảnh thuộc tính',
      position: 'Cạnh phải (360x360)',
      hint: 'Mẫu màu, chất liệu, phụ kiện.',
      status: 'pending',
      asset: 'attribute.png'
    },
    {
      id: 5,
      name: 'Tên sản phẩm',
      position: 'Trên ảnh chính (text)',
      hint: 'Áp dụng font/màu/kích thước bạn nhập.',
      status: 'ready',
      asset: 'text-name'
    },
    {
      id: 6,
      name: 'Tagline/CTA',
      position: 'Dưới tên sản phẩm (text)',
      hint: 'Thông điệp bán hàng ngắn gọn.',
      status: 'auto',
      asset: 'text-tagline'
    }
  ];

  protected fieldValues: Record<number, string> = {
    1: 'Logo sản phẩm PNG',
    2: 'Background do bạn tải lên',
    3: 'Ảnh sản phẩm rõ nét',
    4: 'Ảnh thuộc tính (màu/chất liệu)',
    5: 'Tên sản phẩm',
    6: 'Thông điệp bán hàng'
  };

  protected newSlot = { name: '', position: '', hint: '' };

  protected productData = {
    name: 'Giày chạy bộ AirFlex',
    mainImage: 'airflex-main.png',
    attributeImage: 'airflex-attribute.png',
    logo: 'airflex-logo.png',
    background: 'track-bg.jpg',
    textColor: '#0f172a',
    textFont: 'SF Pro Display',
    textSize: '34px',
    tagline: 'Êm chân, bứt tốc mỗi ngày'
  };

  protected activityLog: ActivityEntry[] = [
    {
      title: 'Dò tọa độ layout',
      detail: 'AI nhận vùng: logo, nền, sản phẩm chính, thuộc tính, text.',
      time: 'Vừa xong',
      tone: 'success'
    },
    {
      title: 'Khớp dữ liệu sản phẩm',
      detail: 'Ghép tên, logo, ảnh chính và ảnh thuộc tính vào bảng mapping.',
      time: '1 phút trước',
      tone: 'info'
    },
    {
      title: 'Áp dụng style chữ',
      detail: 'Màu chữ #0f172a, font SF Pro Display, size 34px.',
      time: '3 phút trước',
      tone: 'success'
    }
  ];

  protected previewNotes = [
    'AI ghép theo layout: nền + sản phẩm + logo + thuộc tính + text.',
    'Bạn được chọn màu chữ, kiểu chữ và cỡ chữ trước khi xuất.',
    'Nếu thiếu ảnh, AI gợi ý phần cần bổ sung thay vì lỗi.'
  ];

  protected showPreview = false;

  protected get completedSlots(): number {
    return this.layoutSlots.filter((slot) => slot.status !== 'pending').length;
  }

  protected styleSummary(): string {
    const { textColor, textFont, textSize } = this.productData;
    return `${textColor} · ${textFont} · ${textSize}`;
  }

  protected slotStatus(id: number): SlotStatus {
    return this.layoutSlots.find((slot) => slot.id === id)?.status ?? 'pending';
  }

  protected handleLayoutUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.layoutImage = file.name;
      this.pushLog('Tải layout mới', `Đã nhận "${file.name}" và cập nhật đánh dấu vùng AI.`, 'info');
    }
  }

  protected syncProductToSlots(): void {
    this.updateValue(1, this.productData.logo);
    this.updateValue(2, this.productData.background);
    this.updateValue(3, this.productData.mainImage);
    this.updateValue(4, this.productData.attributeImage);
    this.updateValue(5, this.productData.name);
    this.updateValue(6, this.productData.tagline);
    this.pushLog('Đồng bộ dữ liệu', 'Áp dụng logo, nền, ảnh sản phẩm và text vào layout.', 'success');
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
    this.pushLog('Tạo preview AI', 'Ghép dữ liệu layout + sản phẩm + style chữ để kiểm tra.', 'success');
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
