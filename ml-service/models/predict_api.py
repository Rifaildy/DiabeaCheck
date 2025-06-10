#!/usr/bin/env python3
import sys
import json
from predict import DiabetesPredictor

def main():
    try:
        # Get input data from command line argument
        input_data = json.loads(sys.argv[1])
        
        # Initialize predictor
        predictor = DiabetesPredictor()
        
        # Make prediction
        result = predictor.predict(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {'error': str(e)}
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
