import React, { useState } from "react";
import { userAPI } from "../services/api";

const accountDetails = [
  {
    id: "tron",
    name: "TRC20",
    address: "TWAu9nifnWbNnrA2DuvtcaqSf7zwpswDSX",
    network: "Tron Network",
    time: "6:39 pm",
  },
  {
    id: "usdt",
    name: "USDT",
    address: "TWAu9nifnWbNnrA2DuvtcaqSf7zwpswDSX",
    network: "USDT Network",
    time: "6:40 pm",
  },
  {
    id: "bnb",
    name: "(2)BNB",
    address: "0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79",
    network: "BNB Network",
    time: "6:41 pm",
  },
  {
    id: "bep20-1",
    name: "BEP20",
    address: "0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79",
    network: "BEP20 Network",
    time: "6:41 pm",
  },
  {
    id: "btc-1",
    name: "(3)BTC",
    address: "0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79",
    network: "Bitcoin Network",
    time: "6:42 pm",
  },
  {
    id: "bep20-2",
    name: "BEP20",
    address: "0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79",
    network: "BEP20 Network",
    time: "6:43 pm",
  },
  {
    id: "btc-2",
    name: "BTC(BITCOIN)",
    address: "15Q3jVisEvkAZiq7pwcEhzCuiNdMgSxh3R",
    network: "Bitcoin Network",
    time: "6:44 pm",
  },
  {
    id: "eth",
    name: "(4)ETH(Ethereum)",
    address: "0x58ff8ecc4b50fbd6e67731854bc05ce2a5e5fc79",
    network: "Ethereum Network",
    time: "6:45 pm",
  },
];

const DepositModal = ({
  isOpen,
  onClose,
  selectedWallet,
  depositAmount,
  planName,
  selectedPlan,
}) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (address, accountId) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedAddress(accountId);
      setTimeout(() => setCopiedAddress(null), 2000);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToBackend = async () => {
    if (!paymentProof) return null;

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(paymentProof);
      });

      // Check if user is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Please log in again.");
        window.location.href = "/login";
        return null;
      }

      // Send to backend using the API service
      const response = await userAPI.uploadImage({
        imageData: base64,
        folder: "payment_proofs",
      });

      setUploadedImageUrl(response.imageUrl);
      return response.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return null;
      }

      alert("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedAccount) {
      alert("Please select an account to send payment to");
      return;
    }

    if (!paymentProof) {
      alert("Please upload proof of payment");
      return;
    }

    let imageUrl = uploadedImageUrl;
    if (!imageUrl) {
      imageUrl = await uploadToBackend();
      if (!imageUrl) return;
    }

    try {
      // Submit deposit to backend using API service
      const response = await userAPI.deposit({
        planId: selectedPlan,
        amount: depositAmount,
        walletType: selectedWallet,
        selectedAccount: selectedAccount,
        paymentProofUrl: imageUrl,
      });

      alert(
        response.message ||
          "Payment proof submitted successfully! We will verify and process your deposit."
      );
      onClose();
    } catch (error) {
      console.error("Error submitting deposit:", error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to submit deposit. Please try again."
      );
    }
  };

  const handleAccountSelect = (accountId) => {
    setSelectedAccount(accountId);
    setShowUploadSection(true);
  };

  const handleCancelClick = () => {
    if (selectedAccount || paymentProof) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const handleCancelCancel = () => {
    setShowCancelConfirmation(false);
  };

  const getWalletAccounts = () => {
    switch (selectedWallet) {
      case "bitcoin":
        return accountDetails.filter((acc) => acc.name.includes("BTC"));
      case "usdt":
        return accountDetails.filter(
          (acc) => acc.name.includes("USDT") || acc.name.includes("TRC20")
        );
      case "tron":
        return accountDetails.filter((acc) => acc.name.includes("TRC20"));
      case "usdc":
        return accountDetails.filter(
          (acc) => acc.name.includes("USDT") || acc.name.includes("ETH")
        );
      case "bep20":
        return accountDetails.filter(
          (acc) => acc.name.includes("BEP20") || acc.name.includes("BNB")
        );
      default:
        return accountDetails;
    }
  };

  const walletAccounts = getWalletAccounts();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl w-full max-w-md flex flex-col max-h-[90vh] my-4">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              Deposit Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1 min-h-0">
            {/* Deposit Summary */}
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Plan:</span>
                <span className="text-white font-medium">{planName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Amount:</span>
                <span className="text-white font-medium">${depositAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Payment Method:</span>
                <span className="text-white font-medium capitalize">
                  {selectedWallet}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">
                Payment Instructions:
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Select one of the accounts below and transfer exactly{" "}
                <span className="text-red-400 font-semibold">
                  ${depositAmount}
                </span>{" "}
                to complete your deposit.
              </p>
            </div>

            {/* Account List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium text-sm">
                  Available {selectedWallet.toUpperCase()} Accounts:
                </h4>
                {selectedAccount && (
                  <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">
                    Account Selected
                  </span>
                )}
              </div>
              {walletAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`bg-slate-700 rounded-lg p-3 border cursor-pointer transition-colors ${
                    selectedAccount === account.id
                      ? "border-red-400 bg-slate-600"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  onClick={() => handleAccountSelect(account.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">
                          {account.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {account.time}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {account.network}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded p-2 mt-2">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-gray-300 break-all flex-1 mr-2">
                        {account.address}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(account.address, account.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Copy address"
                      >
                        {copiedAddress === account.id ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Proof of Payment Section */}
            {showUploadSection && (
              <div className="mt-4 bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <h4 className="text-white font-medium text-sm mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 text-red-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Proof of Payment:
                </h4>

                {!previewImage ? (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label
                      htmlFor="payment-proof"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="w-12 h-12 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="text-gray-300 text-sm">
                        Click to upload payment screenshot
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Payment proof preview"
                        className="w-full h-48 object-cover rounded-lg border border-slate-600"
                      />
                      <button
                        onClick={() => {
                          setPreviewImage(null);
                          setPaymentProof(null);
                          setUploadedImageUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">
                          {paymentProof?.name || "Payment proof"}
                        </span>
                        <span className="text-green-400 text-sm">
                          ✓ Ready to upload
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warning */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.098 21.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <p className="text-red-400 text-xs font-medium mb-1">
                    Important:
                  </p>
                  <ul className="text-red-300 text-xs space-y-1">
                    <li>• Send only the exact amount: ${depositAmount}</li>
                    <li>• Use only the selected network</li>
                    <li>• Double-check the address before sending</li>
                    <li>• Transaction may take 10-30 minutes to confirm</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <div className="flex space-x-3">
              <button
                onClick={handleCancelClick}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
                  selectedAccount && paymentProof && !isUploading
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                disabled={!selectedAccount || !paymentProof || isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  "I Have Sent Payment"
                )}
              </button>
            </div>
          </div>

          {/* Cancel Confirmation Dialog */}
          {showCancelConfirmation && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 rounded-xl">
              <div className="bg-slate-700 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-white font-semibold mb-3">
                  Cancel Deposit?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Are you sure you want to cancel? Any progress will be lost.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelCancel}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    No, Continue
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
