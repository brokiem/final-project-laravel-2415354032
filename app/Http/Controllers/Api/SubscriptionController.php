<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Subscription::query()->with(['customer', 'service']);

        if ($status = $request->query('status')) {
            $allowedStatuses = ['active', 'inactive', 'trial', 'isolir', 'dismantle'];

            if (!in_array($status, $allowedStatuses, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'status' => ['The selected status is invalid.'],
                    ],
                ], 422);
            }

            $query->where('status', $status);
        }

        $subscriptions = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Subscriptions retrieved successfully',
            'data' => $subscriptions,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'in:active,inactive,trial,isolir,dismantle'],
        ]);

        $customer = Customer::query()->find($data['customer_id']);
        $service = Service::query()->find($data['service_id']);

        if (!$customer || !$service) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'customer_id' => $customer ? [] : ['The selected customer id is invalid.'],
                    'service_id' => $service ? [] : ['The selected service id is invalid.'],
                ],
            ], 422);
        }

        $subscription = Subscription::query()->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Subscription created successfully',
            'data' => $subscription->load(['customer', 'service']),
        ], 201);
    }

    public function show(int $subscription): JsonResponse
    {
        $subscription = Subscription::query()->with(['customer', 'service'])->find($subscription);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found',
                'errors' => [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Subscription retrieved successfully',
            'data' => $subscription,
        ]);
    }

    public function update(Request $request, int $subscription): JsonResponse
    {
        $subscription = Subscription::query()->find($subscription);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found',
                'errors' => [],
            ], 404);
        }

        $data = $request->validate([
            'customer_id' => ['sometimes', 'integer', 'exists:customers,id'],
            'service_id' => ['sometimes', 'integer', 'exists:services,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'in:active,inactive,trial,isolir,dismantle'],
        ]);

        if (array_key_exists('customer_id', $data) && !Customer::query()->whereKey($data['customer_id'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'customer_id' => ['The selected customer id is invalid.'],
                ],
            ], 422);
        }

        if (array_key_exists('service_id', $data) && !Service::query()->whereKey($data['service_id'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'service_id' => ['The selected service id is invalid.'],
                ],
            ], 422);
        }

        $subscription->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Subscription updated successfully',
            'data' => $subscription->fresh()->load(['customer', 'service']),
        ]);
    }

    public function destroy(int $subscription): JsonResponse
    {
        $subscription = Subscription::query()->find($subscription);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found',
                'errors' => [],
            ], 404);
        }

        $subscription->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscription deleted successfully',
            'data' => null,
        ]);
    }
}
