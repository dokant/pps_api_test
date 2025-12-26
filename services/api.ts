// API 기본 URL
const API_BASE = '/api';

// 타입 정의
export interface PredictRequest {
  estimated_price: number;
  institution?: string;
  bid_type?: string;
  participants?: number;
}

export interface PredictResponse {
  success: boolean;
  estimated_price: number;
  sample_count: number;
  statistics: {
    mean: number;
    std: number;
    median: number;
    q1: number;
    q3: number;
    min: number;
    max: number;
  };
  recommended_rate: {
    optimal: number;
    low: number;
    high: number;
  };
  recommended_amount: {
    optimal: number;
    low: number;
    high: number;
  };
  similar_cases: Array<{
    bid_name: string;
    institution: string;
    amount: number;
    rate: number;
    participants: number;
    date: string;
  }>;
}

export interface ProbabilityRequest {
  my_rate: number;
  estimated_price?: number;
  institution?: string;
  bid_type?: string;
  participants?: number;
}

export interface ProbabilityResponse {
  success: boolean;
  my_rate: number;
  my_amount: number | null;
  win_probability: number;
  percentile: number;
  estimated_rank: number;
  total_participants: number | string;
  risk: {
    level: string;
    color: string;
  };
  recommendation: string;
  z_score: number;
  sample_count: number;
  distribution: {
    mean: number;
    std: number;
    median: number;
    q1: number;
    q3: number;
  };
}

// API 함수들
export const api = {
  // 헬스 체크
  async health() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // 낙찰가 예측
  async predict(params: PredictRequest): Promise<PredictResponse> {
    const query = new URLSearchParams();
    query.set('estimated_price', params.estimated_price.toString());
    if (params.institution) query.set('institution', params.institution);
    if (params.bid_type) query.set('bid_type', params.bid_type);
    if (params.participants) query.set('participants', params.participants.toString());
    
    const res = await fetch(`${API_BASE}/predict?${query}`);
    return res.json();
  },

  // 낙찰 확률 계산
  async probability(params: ProbabilityRequest): Promise<ProbabilityResponse> {
    const query = new URLSearchParams();
    query.set('my_rate', params.my_rate.toString());
    if (params.estimated_price) query.set('estimated_price', params.estimated_price.toString());
    if (params.institution) query.set('institution', params.institution);
    if (params.bid_type) query.set('bid_type', params.bid_type);
    if (params.participants) query.set('participants', params.participants.toString());
    
    const res = await fetch(`${API_BASE}/probability?${query}`);
    return res.json();
  }
};

export default api;
