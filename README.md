# Authors

- Clarissa Harmoko
- Muhammad Ali Ghazali
- Kai Ze Tam
- Kyle Carlo Lasala

# About PharmtomLabs

Our platform helps drug discovery researchers and pharmaceutical companies identify optimal docking poses and analyze atomic interactions more accurately by leveraging Quantum Machine Learning (QML) and Variational Quantum Eigensolver (VQE) that offers deeper (quantum-mechanical) insights than traditional docking tools.

# Installation

- The packages needed to install for this project are listed in the `working_notebook.ipynb` file.
- There is an important caveat for installing Meeko, which is a dependency for this project. As of August 2025, Meeko is giving errors when installing via pip. Therefore, we recommend cloning the repository and installing it from there.

## Meeko

- To install Meeko, clone the repository and run the following command:

```bash
cd resources
git clone https://github.com/forlilab/Meeko.git
cd Meeko
git checkout develop
pip install .
```

# Prototype Description

This prototype presents the initial development of PharmtomLabs, a platform that combines classical molecular docking techniques with Quantum Machine Learning (QML) to improve binding affinity prediction and atomic interaction analysis.

The prototype is structured into two main parts:

1. Part I – Docking Workflow and Theoretical VQE Integration:
   This section demonstrates the full docking pipeline—from molecular preprocessing to optimal pose prediction using tools such as RDKit and Meeko. It also outlines a proposed integration of the Variational Quantum Eigensolver (VQE) for future post-docking quantum mechanical analysis. While VQE is not implemented here, its potential role in calculating interaction energies is explored to guide future extensions of the platform.

2. Part II – Binding Affinity Prediction Using QNN:
   In this part, we implement a Quantum Neural Network (QNN) to predict the binding affinity of the selected ligand-protein complex. The QNN model is trained on preprocessed molecular features to estimate how strongly a compound is likely to bind, offering a quantum-enhanced approach to scoring candidate molecules.

Key features:

- Classical docking pipeline using RDKit and Meeko.

- Structured preparation for quantum-enhanced workflows.

- QNN-based binding affinity prediction implemented with Qiskit Machine Learning.

- All components and experiments are documented in working_notebook.ipynb.

This prototype showcases how quantum models—particularly QNNs—can enhance drug discovery workflows by offering new ways to estimate binding affinities and plan quantum-assisted post-docking analysis. The main platform used for this prototype is qBraid, which provides a user-friendly interface for quantum computing tasks.

# Future Work

- Implement the Variational Quantum Eigensolver (VQE) for post-docking analysis to calculate interaction energies.
- Explore additional quantum machine learning models for improved binding affinity predictions.

# Presentation

- [Pitch Deck](https://www.canva.com/design/DAGu-9Qc-3U/vkbabdZUwydAtGLEGx2tbg/view?utm_content=DAGu-9Qc-3U&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9ab31364c1)
- [Demo UI](https://in-silico-denv-drug-discovery.vercel.app/)
