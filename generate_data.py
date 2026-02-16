
import csv
import random

header = ['People_Count', 'Movement_Speed', 'Density_sqm', 'Area_Zone', 'StampedeRiskLevel']
zones = ['Entry', 'Main_Hall', 'Exit']
risks = ['Low', 'Medium', 'High']

with open('cctv_data.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    for _ in range(100):
        writer.writerow([
            random.randint(50, 500),
            round(random.uniform(0.5, 5.0), 2),
            round(random.uniform(1, 10), 2),
            random.choice(zones),
            random.choice(risks)
        ])

print('File cctv_data.csv created successfully.')
