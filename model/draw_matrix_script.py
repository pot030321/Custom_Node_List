import sys
import json
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

def draw_matrix(data_json, target_column):
    # Chuyển đổi dữ liệu JSON thành DataFrame
		df = pd.DataFrame(data_json)
		X = df.drop(columns=[target_column])  # Loại bỏ cột mục tiêu khỏi đầu vào

		# Vẽ ma trận tương quan
		plt.figure(figsize=(10, 10))
		sns.heatmap(X.corr(), annot=True, cmap='coolwarm', fmt=".2f")
		plt.title('Correlation Matrix')
		plt.show()

# Lấy dữ liệu JSON từ stdin
if __name__ == "__main__":
		input_data = json.loads(sys.stdin.read())
		target_column = input_data["target_column"]
		data_json = input_data["data"]

		draw_matrix(data_json, target_column)
