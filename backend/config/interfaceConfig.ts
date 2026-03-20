export interface IResponseConfig {
    success: boolean;
    message?: string;
    data?: any;
}

export interface IGoBangGameInfo {
    black_player_name: string | null;
    white_player_name: string | null;
    current_turn: 0 | 1;
    board_state: string;
}