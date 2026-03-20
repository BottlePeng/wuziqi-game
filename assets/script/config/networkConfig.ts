export const networkConfig = {
    baseUrl: 'http://localhost:3000',   // 开发环境地址，发布时改为你的线上域名
}

export interface IResponseConfig {
    success: boolean;
    message?: string;
    data?: any;
}

export interface IGoBangGameInfo {
    black_player_name: string | null;
    white_player_name: string | null;
    current_turn: 0 | 1; // 0-黑棋，1-白棋
    board_state: Array<Array<0 | 1 | 2>>;
}