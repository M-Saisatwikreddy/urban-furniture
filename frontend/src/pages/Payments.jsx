import { useEffect, useState } from "react";
import axios from "axios";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [vendorBills, setVendorBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    type: "VENDOR_BILL",
    documentId: "",
    method: "BANK",
    amount: "",
    reference: "",
  });

  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const [paymentResponse, billResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/payments"),
          axios.get("http://localhost:5000/api/vendor-bills"),
        ]);

      setPayments(paymentResponse.data);
      setVendorBills(billResponse.data);

      try {
        const invoiceResponse = await axios.get(
          "http://localhost:5000/api/invoices"
        );

        setInvoices(invoiceResponse.data);
      } catch (error) {
        console.log("Invoices API not available yet.");
        setInvoices([]);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableBills = vendorBills.filter(
    (bill) => Number(bill.paidAmount) < Number(bill.total)
  );

  const availableInvoices = invoices.filter(
    (invoice) =>
      Number(invoice.paidAmount) < Number(invoice.total)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "type") {
      setFormData((previous) => ({
        ...previous,
        type: value,
        documentId: "",
        amount: "",
      }));

      setSelectedDocument(null);
      return;
    }

    if (name === "documentId") {
      const list =
        formData.type === "VENDOR_BILL"
          ? vendorBills
          : invoices;

      const document = list.find(
        (item) => item.id === Number(value)
      );

      setSelectedDocument(document || null);

      if (document) {
        const remaining =
          Number(document.total) -
          Number(document.paidAmount);

        setFormData((previous) => ({
          ...previous,
          amount: remaining,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.documentId) {
      alert("Please select a bill or invoice.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      const paymentNumber = `PAY-${Date.now()}`;

      const data = {
        paymentNumber,
        contactId: Number(selectedDocument.contactId),
        method: formData.method,
        amount: Number(formData.amount),
        reference: formData.reference || null,
      };

      if (formData.type === "VENDOR_BILL") {
        data.vendorBillId = Number(formData.documentId);
      } else {
        data.invoiceId = Number(formData.documentId);
      }

      await axios.post(
        "http://localhost:5000/api/payments",
        data
      );

      alert("Payment created successfully!");

      setFormData({
        type: "VENDOR_BILL",
        documentId: "",
        method: "BANK",
        amount: "",
        reference: "",
      });

      setSelectedDocument(null);
      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error("Failed to create payment:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create payment."
      );
    }
  };

  const getRemaining = (document) => {
    if (!document) {
      return 0;
    }

    return (
      Number(document.total) -
      Number(document.paidAmount)
    );
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Manage payments against bills and invoices</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Record Payment
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Record Payment</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Payment For</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="VENDOR_BILL">
                    Vendor Bill
                  </option>
                  <option value="INVOICE">
                    Sales Invoice
                  </option>
                </select>
              </div>

              <div>
                <label>
                  {formData.type === "VENDOR_BILL"
                    ? "Vendor Bill"
                    : "Sales Invoice"}
                </label>

                <select
                  name="documentId"
                  value={formData.documentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select document
                  </option>

                  {formData.type === "VENDOR_BILL"
                    ? availableBills.map((bill) => (
                        <option
                          key={bill.id}
                          value={bill.id}
                        >
                          {bill.billNumber} -{" "}
                          {bill.contact?.name || "Vendor"}{" "}
                          - ₹
                          {Number(
                            bill.total
                          ).toLocaleString("en-IN")}
                        </option>
                      ))
                    : availableInvoices.map((invoice) => (
                        <option
                          key={invoice.id}
                          value={invoice.id}
                        >
                          {invoice.invoiceNumber} -{" "}
                          {invoice.contact?.name ||
                            "Customer"}{" "}
                          - ₹
                          {Number(
                            invoice.total
                          ).toLocaleString("en-IN")}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label>Payment Method</label>

                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                >
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label>Payment Amount</label>

                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Reference</label>

                <input
                  type="text"
                  name="reference"
                  placeholder="Transaction / cheque reference"
                  value={formData.reference}
                  onChange={handleChange}
                />
              </div>
            </div>

            {selectedDocument && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "18px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <h3 style={{ marginBottom: "14px" }}>
                  Payment Summary
                </h3>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span>Document Total</span>
                  <strong>
                    ₹
                    {Number(
                      selectedDocument.total
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span>Already Paid</span>
                  <strong>
                    ₹
                    {Number(
                      selectedDocument.paidAmount
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>Remaining</strong>
                  <strong>
                    ₹
                    {getRemaining(
                      selectedDocument
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedDocument(null);

                  setFormData({
                    type: "VENDOR_BILL",
                    documentId: "",
                    method: "BANK",
                    amount: "",
                    reference: "",
                  });
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Payment Register</h3>
            <p>{payments.length} payments</p>
          </div>
        </div>

        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <div>💰</div>
            <h3>No Payments Yet</h3>
            <p>
              Record a payment against a vendor bill or
              sales invoice.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Payment Number</th>
                  <th>Contact</th>
                  <th>Document</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>
                        {payment.paymentNumber}
                      </strong>
                    </td>

                    <td>
                      {payment.contact?.name || "-"}
                    </td>

                    <td>
                      {payment.vendorBill
                        ? payment.vendorBill.billNumber
                        : payment.invoice
                          ? payment.invoice.invoiceNumber
                          : "-"}
                    </td>

                    <td>{payment.method}</td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          payment.amount
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      {payment.reference || "-"}
                    </td>

                    <td>
                      {new Date(
                        payment.paymentDate
                      ).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;