'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { Button, Card, LoadingSpinner } from '@/components/ui/index';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { IPrescription } from '@/types';
import { Download, FileText, Pill } from 'lucide-react';
import jsPDF from 'jspdf';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await apiClient.getPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      toast.error('Failed to load prescriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async (prescriptionId: string) => {
    try {
      const prescription = prescriptions.find(p => p._id === prescriptionId);
      if (!prescription) return;

      const doc = new jsPDF();
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('MediSync', 15, 25);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Medical Prescription', 15, 55);
      
      doc.setFontSize(11);
      doc.text(`Patient: ${prescription.patient.name}`, 15, 70);
      doc.text(`Doctor: ${prescription.doctor.name}`, 15, 80);
      doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, 15, 90);
      
      doc.setFontSize(12);
      doc.text('Medications:', 15, 110);
      
      let yPosition = 120;
      prescription.medications.forEach((med) => {
        doc.setFontSize(11);
        doc.text(`• ${med.name} - ${med.dosage}`, 20, yPosition);
        doc.setFontSize(10);
        doc.text(`  Frequency: ${med.frequency} | Duration: ${med.duration}`, 25, yPosition + 5);
        if (med.instructions) {
          doc.text(`  Instructions: ${med.instructions}`, 25, yPosition + 10);
        }
        yPosition += 15;
      });
      
      if (prescription.notes) {
        doc.setFontSize(11);
        doc.text('Notes:', 15, yPosition + 10);
        doc.setFontSize(10);
        doc.text(prescription.notes, 20, yPosition + 20, { maxWidth: 170 });
      }
      
      doc.save(`prescription_${prescriptionId}.pdf`);
      toast.success('Prescription downloaded');
    } catch (error) {
      toast.error('Failed to download prescription');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Prescriptions</h1>

        {prescriptions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No prescriptions yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">Your prescriptions will appear here after consultations</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <motion.div
                key={prescription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {prescription.doctor.name}'s Prescription
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => downloadPDF(prescription._id)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <Pill className="w-4 h-4" /> Medications
                      </h4>
                      <div className="space-y-2">
                        {prescription.medications.map((med, i) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                            {med.instructions && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Instructions: {med.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {prescription.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                        <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          {prescription.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
