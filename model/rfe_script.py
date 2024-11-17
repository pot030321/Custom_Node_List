import pandas as pd
import numpy as np
import json
import sys
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.feature_selection import RFE
from sklearn.preprocessing import StandardScaler

def perform_rfe(data_json, target_column, num_features):
    # Chuyển đổi dữ liệu JSON thành DataFrame
    data = pd.DataFrame(data_json)

    # Xử lý dữ liệu null
    data.fillna(data.mean(), inplace=True)

    # Tách cột mục tiêu và dữ liệu đầu vào
    X = data.drop(columns=[target_column])
    y = data[target_column]

    # Chuẩn hóa dữ liệu
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(X)

    # Áp dụng RFE
    model = LogisticRegression(max_iter=1000, random_state=42)
    rfe = RFE(estimator=model, n_features_to_select=num_features)
    rfe.fit(x_scaled, y)

    # Lấy tên cột đã được chọn
    selected_features = X.columns[rfe.support_]

    # Tạo DataFrame mới với các cột đã chọn
    cleaned_data = pd.concat([data[selected_features], y], axis=1)

    # Lưu file cleaned_data.csv
    output_path = 'cleaned_data.csv'
    cleaned_data.to_csv(output_path, index=False)

    return {
        "selected_features": list(selected_features),
        "output_file": output_path
    }

# Lấy dữ liệu JSON từ stdin
if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    num_features = input_data["num_features"]
    target_column = input_data["target_column"]
    data_json = input_data["data"]

    result = perform_rfe(data_json, target_column, num_features)

    # Trả kết quả dưới dạng JSON
    print(json.dumps(result, indent=4))
