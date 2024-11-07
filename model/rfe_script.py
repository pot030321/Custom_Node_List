import sys
import json
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

def perform_rfe(data_json, target_column, num_features):
    # Chuyển đổi dữ liệu JSON thành DataFrame
    df = pd.DataFrame(data_json)
    X = df.drop(columns=[target_column])  # Loại bỏ cột mục tiêu khỏi đầu vào
    y = df[target_column]

    # Áp dụng RFE với RandomForestClassifier
    model = RandomForestClassifier(min_samples_leaf=1, max_features='auto', random_state=42)
    rfe = RFE(model, n_features_to_select=num_features)
    rfe.fit(X, y)

    # Trả về các features được chọn
    selected_features = X.columns[rfe.support_].tolist()
    return selected_features

# Lấy dữ liệu JSON từ stdin
if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    num_features = input_data["num_features"]
    target_column = input_data["target_column"]
    data_json = input_data["data"]

    result = perform_rfe(data_json, target_column, num_features)

    # In kết quả dưới dạng JSON để trả lại cho n8n
    print(json.dumps(result))
